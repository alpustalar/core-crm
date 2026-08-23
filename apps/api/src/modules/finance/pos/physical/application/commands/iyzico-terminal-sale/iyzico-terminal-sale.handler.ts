import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { PosDeviceNotFoundException } from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { IyzicoTerminalSaleCommand } from './iyzico-terminal-sale.command';
import type { IyzicoTerminalSaleResponse } from './iyzico-terminal-sale.response';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction/pos-transaction.command.repository';
import { ResolveIyzicoTerminalCredentialsService } from '@modules/finance/pos/physical/application/services/resolve-iyzico-terminal-credentials.service';
import { IyzicoTerminalService } from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/iyzico-terminal.service';
import {
  IYZICO_TERMINAL_RETRYABLE_GROUPS,
  IyzicoTerminalAuthError,
  IyzicoTerminalOperationError,
} from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/iyzico-terminal.errors';
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
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { PosTransaction } from '@modules/finance/pos/physical/domain/entities/pos-transaction.entity';
import {
  IyzicoTerminalSalesTypeSchema,
  IyzicoTerminalStatusSchema,
} from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/iyzico-terminal.contracts';
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

@CommandHandler(IyzicoTerminalSaleCommand)
export class IyzicoTerminalSaleHandler
  implements
    ICommandHandler<IyzicoTerminalSaleCommand, IyzicoTerminalSaleResponse>
{
  private readonly logger = new Logger(IyzicoTerminalSaleHandler.name);

  constructor(
    @Inject(POS_DEVICE_COMMAND_REPOSITORY)
    private readonly posDeviceRepo: IPosDeviceCommandRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionRepo: IPosTransactionCommandRepository,
    private readonly credentialsResolver: ResolveIyzicoTerminalCredentialsService,
    private readonly iyzicoTerminalService: IyzicoTerminalService,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly criticalFailure: CriticalFailurePublisher
  ) {}

  async execute(
    command: IyzicoTerminalSaleCommand
  ): Promise<IyzicoTerminalSaleResponse> {
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

    // Provider doğrulaması + kimlik çözümleme (yanlış provider'da domain hatası fırlatır)

    const deviceUniqueId = device.iyzicoDeviceUniqueId.orThrow();

    const credentials = await this.credentialsResolver.resolve(input.clinicId);

    // Faz 1 — ödeme kaydı + PENDING işlem atomik olarak oluşturulur (HTTP öncesi)
    const { posTransactionId, transaction, paymentId } =
      await this.txManager.outboxRun(async () => {
        let resolvedPaymentId = input.paymentId;

        const newPaymentId = UUID.generate().value;

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
              { paymentId: newPaymentId }
            )
          );
          resolvedPaymentId = newPaymentId;
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
          posTransactionId: posTransaction.id.value,
          transaction: tx,
          paymentId: resolvedPaymentId,
        };
      });

    // Faz 2 — iyzico Terminal Host API çağrısı (transaction dışında; bloke edici)
    try {
      const result = await this.iyzicoTerminalService.completePayment({
        credentials,
        deviceUniqueId,
        conversationId: posTransactionId,
        transactionReferenceId: posTransactionId,
        price: input.amount,
        currency: input.currency,
        salesType: IyzicoTerminalSalesTypeSchema.enum.SALE,
        installment: input.installment ?? 0,
      });

      const approved =
        result.status === IyzicoTerminalStatusSchema.enum.SUCCESS;
      const iyzicoPaymentId = result.paymentId ?? posTransactionId;

      // Faz 3 — sonuç + payment senkron + ledger atomik (outboxRun)
      await this.txManager.outboxRun(async () => {
        if (approved) {
          transaction.markSuccess(iyzicoPaymentId, result);
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
          transaction.markFailed(result);
          await this.posTransactionRepo.update(transaction);
          if (paymentId) {
            await this.posPaymentSync.markFailed({
              paymentId,
              clinicId: input.clinicId,
              reason: result.errorMessage,
            });
          }
        }
      });

      const status = approved
        ? PosTransactionStatusSchema.enum.SUCCESS
        : PosTransactionStatusSchema.enum.FAILED;

      this.logger.log(
        `iyzico terminal satış tamamlandı: id=${posTransactionId} status=${status}`
      );

      return {
        posTransactionId,
        status,
        approved,
        iyzicoPaymentId: approved ? iyzicoPaymentId : undefined,
        authCode: result.authCode,
        hostReference: result.hostReference,
        maskedCardNumber: result.lastFourDigits
          ? `**** **** **** ${result.lastFourDigits}`
          : undefined,
        cardType: result.cardType,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
      };
    } catch (err) {
      // Cihaz/timeout kaynaklı hatalar → işlem PENDING bırakılır (reconcile/manuel)
      if (
        err instanceof IyzicoTerminalOperationError &&
        IYZICO_TERMINAL_RETRYABLE_GROUPS.has(err.group)
      ) {
        this.logger.warn(
          `iyzico terminal satış geçici hata (${err.group}): id=${posTransactionId} — PENDING kalıyor`
        );
        return {
          posTransactionId,
          status: PosTransactionStatusSchema.enum.PENDING,
        };
      }

      if (
        err instanceof IyzicoTerminalOperationError ||
        err instanceof IyzicoTerminalAuthError
      ) {
        await this.txManager.outboxRun(async () => {
          transaction.markFailed();
          await this.posTransactionRepo.update(transaction);
          if (paymentId) {
            await this.posPaymentSync.markFailed({
              paymentId,
              clinicId: input.clinicId,
              reason: err.message,
            });
          }
        });
        this.logger.error(
          `iyzico terminal satış hatası: id=${posTransactionId} — ${err.message}`
        );
        return {
          posTransactionId,
          status: PosTransactionStatusSchema.enum.FAILED,
        };
      }

      throw err;
    }
  }

  /**
   * iyzico kart tahsilatını muhasebe katmanına köprüler: cari garanti +
   * PAYMENT_RECEIVED olayı (POS → 108). dedupeKey ile idempotent; köprü hatası
   * tahsilatı bozmaz.
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
