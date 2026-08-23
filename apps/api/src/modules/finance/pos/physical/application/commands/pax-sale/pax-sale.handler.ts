import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { PosDeviceNotFoundException } from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { PaxSaleCommand } from './pax-sale.command';
import type { PaxSaleResponse } from './pax-sale.response';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction/pos-transaction.command.repository';
import { PaxService } from '@src/infrastructure/payment/pos/physical/providers/pax/pax.service';
import {
  PaxConnectionError,
  PaxTimeoutError,
} from '@src/infrastructure/payment/pos/physical/providers/pax/pax.errors';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreatePaymentCommand } from '@modules/finance/payment/application/commands/create-payment/create-payment.command';
import PaymentMethodSchema from '@input-type-schemas/PaymentMethodSchema';
import PosTransactionStatusSchema from '@input-type-schemas/PosTransactionStatusSchema';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PosPaymentSyncService } from '@modules/finance/pos/physical/application/services/pos-payment-sync.service';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import { FinancialEventTypeSchema, PartyRoleSchema } from '@shared';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import { FINANCIAL_EVENT_SOURCE_MODULES } from '@modules/finance/shared/domain/constants/financial-event-source-modules.constant';
import { FinancialEventDedupeKeys } from '@modules/finance/shared/domain/constants/financial-event-dedupe-keys.constant';
import {
  IPosDeviceCommandRepository,
  POS_DEVICE_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device/pos-device.command.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { POS_EVENTS } from '@src/domain/constants/events';
import { CriticalFailurePublisher } from '@common/observability/critical-failure.publisher';

@CommandHandler(PaxSaleCommand)
export class PaxSaleHandler
  implements ICommandHandler<PaxSaleCommand, PaxSaleResponse>
{
  private readonly logger = new Logger(PaxSaleHandler.name);

  constructor(
    @Inject(POS_DEVICE_COMMAND_REPOSITORY)
    private readonly posDeviceRepo: IPosDeviceCommandRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionRepo: IPosTransactionCommandRepository,
    private readonly paxService: PaxService,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  async execute(command: PaxSaleCommand): Promise<PaxSaleResponse> {
    const { input, ctx } = command;

    // `clinicId` istek gövdesinden geliyor — aktörün kendi kliniği DEĞİL. Bu
    // kontrol olmadan, POS yetkisi olan herhangi bir personel gövdeye başka bir
    // kliniğin id'sini yazıp o kliniğin terminalinde işlem yürütebilirdi.
    this.policyFactory
      .finance(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicFinances(input.clinicId))
      .orThrow(POS_EVENTS.TRANSACTION_INITIATED);

    const device = await this.posDeviceRepo.findById(input.posDeviceId);
    if (!device) {
      throw new PosDeviceNotFoundException();
    }

    // Yetki `input.clinicId` üzerinden verildi; cihaz AYRI bir alandan geliyor. Bu doğrulama
    // olmadan kendi kliniğinin id'siyle başka kliniğin terminali sürülebilirdi.
    device.assertBelongsToClinic(input.clinicId);

    device.validate.status.isActive.orThrow();

    // Faz 1 — ödeme kaydı + PENDING işlem atomik olarak oluşturulur (TCP öncesi)
    const { posTransactionId, transaction, paymentId } =
      await this.txManager.outboxRun(async () => {
        let resolvedPaymentId = input.paymentId;

        const paymentId = crypto.randomUUID();
        if (!resolvedPaymentId && input.patientId) {
          await this.commandBus.execute(
            new CreatePaymentCommand(
              {
                clinicId: input.clinicId,
                patientId: input.patientId,
                appointmentId: input.appointmentId,
                amount: input.amount,
                currency: input.currency,
                method: PaymentMethodSchema.enum.CREDIT_CARD,
              },
              { paymentId }
            )
          );
          resolvedPaymentId = paymentId;
        }

        const posTransaction = PosTransaction.create({
          posDeviceId: device.id.value,
          clinicId: input.clinicId,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          paymentId: resolvedPaymentId,
          amount: input.amount,
          currency: input.currency,
        });

        const tx = await this.posTransactionRepo.create(posTransaction);
        return {
          posTransactionId: tx.id.value,
          transaction: tx,
          paymentId: resolvedPaymentId,
        };
      });

    // Faz 2 — PAX TCP çağrısı (transaction dışında; bloke edici, ~90s)
    try {
      const result = await this.paxService.sale({
        device: device.getPaxConnection(),
        amountInMinorUnits: Math.round(input.amount * 100),
        ecReferenceNumber: posTransactionId,
      });

      // Faz 3 — sonuç + payment senkron + ledger atomik (outboxRun)
      await this.txManager.outboxRun(async () => {
        if (result.approved) {
          transaction.markSuccess(result.externalRef, result.rawResponse);
          await this.posTransactionRepo.update(transaction);
          if (paymentId) {
            await this.posPaymentSync.markPaid({
              paymentId,
              clinicId: input.clinicId,
            });
          }
          // Muhasebe köprüsü: kart tahsilatı → 108 / 120 (cari hasta varsa).
          if (input.patientId) {
            await this.recordPosPaymentReceived({
              patientId: input.patientId,
              clinicId: input.clinicId,
              amount: transaction.amount.value.toString(),
              posTransactionId,
            });
          }
        } else {
          transaction.markFailed(result.rawResponse);
          await this.posTransactionRepo.update(transaction);
          if (paymentId) {
            await this.posPaymentSync.markFailed({
              paymentId,
              clinicId: input.clinicId,
              reason: result.responseText,
            });
          }
        }
      });

      const status = result.approved
        ? PosTransactionStatusSchema.enum.SUCCESS
        : PosTransactionStatusSchema.enum.FAILED;

      this.logger.log(
        `PAX satış tamamlandı: id=${posTransactionId} status=${status}`
      );

      return {
        posTransactionId,
        status,
        approved: result.approved,
        responseText: result.responseText,
        authorizationCode: result.authorizationCode,
        externalRef: result.externalRef,
        maskedCardNumber: result.maskedCardNumber,
        cardType: result.cardType,
      };
    } catch (err) {
      if (err instanceof PaxTimeoutError) {
        this.logger.warn(
          `PAX satış timeout: id=${posTransactionId} — PENDING kalıyor`
        );
        return {
          posTransactionId,
          status: PosTransactionStatusSchema.enum.PENDING,
        };
      }

      if (err instanceof PaxConnectionError) {
        await this.txManager.outboxRun(async () => {
          transaction.markFailed();
          await this.posTransactionRepo.update(transaction);
          if (paymentId) {
            await this.posPaymentSync.markFailed({
              paymentId,
              clinicId: input.clinicId,
              reason: 'POS cihazına bağlanılamadı',
            });
          }
        });
        this.logger.error(`PAX satış bağlantı hatası: id=${posTransactionId}`);
        return {
          posTransactionId,
          status: PosTransactionStatusSchema.enum.FAILED,
        };
      }

      throw err;
    }
  }

  /**
   * PAX kart tahsilatını muhasebe katmanına köprüler: cari garanti + PAYMENT_RECEIVED
   * olayı (POS → 108). dedupeKey ile idempotent; köprü hatası tahsilatı bozmaz.
   */
  private async recordPosPaymentReceived(
    input: RecordPosPaymentReceivedInput
  ): Promise<void> {
    const ctx = ExecutionContextFactory.createInternal();

    try {
      const { partyId } = await this.commandBus.execute(
        new EnsurePartyForPatientCommand(
          input.patientId,
          input.clinicId,
          PartyRoleSchema.enum.CUSTOMER,
          ctx
        )
      );

      await this.commandBus.execute(
        new RecordFinancialEventCommand(
          {
            clinicId: input.clinicId,
            type: FinancialEventTypeSchema.enum.PAYMENT_RECEIVED,
            payload: { method: 'POS_CARD', amount: input.amount, partyId },
            sourceModule: FINANCIAL_EVENT_SOURCE_MODULES.POS,
            sourceRefId: input.posTransactionId,
            dedupeKey: FinancialEventDedupeKeys.payment_received_pos(
              input.posTransactionId
            ),
          },
          ctx
        )
      );
    } catch (error) {
      this.logger.error(
        `Muhasebe köprüsü başarısız: posTransactionId=${input.posTransactionId}`,
        error
      );
      // Kart çekildi (para tahsil edildi) ama ekonomik olay kaydedilmedi:
      // tahsilat deftere hiç düşmez ve bunu fark edecek başka bir mekanizma yok.
      this.criticalFailure.publish({
        operation: 'finance.pos.accounting-bridge',
        severity: 'CRITICAL',
        summary: 'POS tahsilatı alındı ancak muhasebe köprüsü çalışmadı.',
        errorMessage: error instanceof Error ? error.message : String(error),
        context: {
          posTransactionId: input.posTransactionId,
          patientId: input.patientId,
          amount: input.amount,
        },
        clinicId: input.clinicId,
        dedupeKey: `pos-bridge-failed:${input.posTransactionId}`,
      });
    }
  }
}

interface RecordPosPaymentReceivedInput {
  patientId: string;
  clinicId: string;
  amount: string;
  posTransactionId: string;
}
