import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { PosDeviceNotFoundException } from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { PaxSaleCommand } from './pax-sale.command';
import type { PaxSaleResponse } from './pax-sale.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
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

@CommandHandler(PaxSaleCommand)
export class PaxSaleHandler implements ICommandHandler<
  PaxSaleCommand,
  PaxSaleResponse
> {
  private readonly logger = new Logger(PaxSaleHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly paxService: PaxService,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService
  ) {}

  async execute(command: PaxSaleCommand): Promise<PaxSaleResponse> {
    const { input } = command;

    const device = await this.posDeviceQueryRepo.findById(input.posDeviceId);
    if (!device || !device.isActive) {
      throw new PosDeviceNotFoundException();
    }

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

        const id = crypto.randomUUID();
        const tx = await this.posTransactionCommandRepo.create({
          id,
          posDeviceId: device.id,
          clinicId: input.clinicId,
          patientId: input.patientId,
          appointmentId: input.appointmentId,
          paymentId: resolvedPaymentId,
          amount: input.amount,
          currency: input.currency,
        });
        return {
          posTransactionId: id,
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
          await this.posTransactionCommandRepo.save(transaction);
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
              amount: transaction.amount.amount.toString(),
              posTransactionId,
            });
          }
        } else {
          transaction.markFailed(result.rawResponse);
          await this.posTransactionCommandRepo.save(transaction);
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
          await this.posTransactionCommandRepo.save(transaction);
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
      const { partyId, organizationId } = await this.commandBus.execute(
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
            organizationId,
            clinicId: input.clinicId,
            type: FinancialEventTypeSchema.enum.PAYMENT_RECEIVED,
            payload: { method: 'POS_CARD', amount: input.amount, partyId },
            sourceModule: 'pos',
            sourceRefId: input.posTransactionId,
            dedupeKey: `payment-received:pos:${input.posTransactionId}`,
          },
          ctx
        )
      );
    } catch (error) {
      this.logger.error(
        `Muhasebe köprüsü başarısız: posTransactionId=${input.posTransactionId}`,
        error
      );
    }
  }
}

interface RecordPosPaymentReceivedInput {
  patientId: string;
  clinicId: string;
  amount: string;
  posTransactionId: string;
}
