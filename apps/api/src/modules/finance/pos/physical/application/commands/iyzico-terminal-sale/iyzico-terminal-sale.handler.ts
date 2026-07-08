import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { PosDeviceNotFoundException } from '@modules/finance/pos/physical/domain/exceptions/pos.exceptions';
import { IyzicoTerminalSaleCommand } from './iyzico-terminal-sale.command';
import type { IyzicoTerminalSaleResponse } from './iyzico-terminal-sale.response';
import {
  IPosDeviceQueryRepository,
  POS_DEVICE_QUERY_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-device.repository';
import {
  IPosTransactionCommandRepository,
  POS_TRANSACTION_COMMAND_REPOSITORY,
} from '@modules/finance/pos/physical/domain/repositories/pos-transaction.repository';
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

@CommandHandler(IyzicoTerminalSaleCommand)
export class IyzicoTerminalSaleHandler
  implements
    ICommandHandler<IyzicoTerminalSaleCommand, IyzicoTerminalSaleResponse>
{
  private readonly logger = new Logger(IyzicoTerminalSaleHandler.name);

  constructor(
    @Inject(POS_DEVICE_QUERY_REPOSITORY)
    private readonly posDeviceQueryRepo: IPosDeviceQueryRepository,
    @Inject(POS_TRANSACTION_COMMAND_REPOSITORY)
    private readonly posTransactionCommandRepo: IPosTransactionCommandRepository,
    private readonly credentialsResolver: ResolveIyzicoTerminalCredentialsService,
    private readonly iyzicoTerminalService: IyzicoTerminalService,
    private readonly commandBus: TSCommandBus,
    private readonly txManager: TransactionManager,
    private readonly posPaymentSync: PosPaymentSyncService
  ) {}

  async execute(
    command: IyzicoTerminalSaleCommand
  ): Promise<IyzicoTerminalSaleResponse> {
    const { input } = command;

    const device = await this.posDeviceQueryRepo.findById(input.posDeviceId);
    if (!device) {
      throw new PosDeviceNotFoundException();
    }

    device.validate.status.isActive().orThrow();

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

        const tx = await this.posTransactionCommandRepo.create(posTransaction);
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
          transaction.markFailed(result);
          await this.posTransactionCommandRepo.save(transaction);
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
          await this.posTransactionCommandRepo.save(transaction);
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
      const { partyId, organizationId } = await this.commandBus.execute(
        new EnsurePartyForPatientCommand(
          input.patientId,
          input.clinicId,
          PartyRoleSchema.enum.CUSTOMER,
          ctx
        )
      );

      // TODO: burda string kısımlar bi sabitte gerekli yerlerde modüler şekilde tutulacak
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
