import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandlePaymentCallbackCommand } from './handle-payment-callback.command';
import { HandlePaymentCallbackCommandResponse } from './handle-payment-callback.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { Inject, Logger } from '@nestjs/common';
import { IyzicoTransactionNotFoundException } from '@modules/finance/pos/virtual/domain/exceptions/iyzico.exceptions';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { MarkInstallmentAsPaidCommand } from '@modules/finance/payment/application/commands/mark-installment-as-paid/mark-installment-as-paid.command';
import { MarkInstallmentAsFailedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-failed/mark-installment-as-failed.command';
import { EnsurePartyForPatientCommand } from '@modules/finance/party/application/commands/ensure-party-for-patient/ensure-party-for-patient.command';
import { RecordFinancialEventCommand } from '@modules/finance/accounting/financial-events/application/commands/record-financial-event/record-financial-event.command';
import { FinancialEventTypeSchema, PartyRoleSchema } from '@shared';
import PaymentMethodSchema, {
  PaymentMethodType as PaymentMethod,
} from '@input-type-schemas/PaymentMethodSchema';
import {
  IIyzicoTransactionCommandRepository,
  IIyzicoTransactionQueryRepository,
  IYZICO_TRANSACTION_COMMAND_REPOSITORY,
  IYZICO_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { IyzicoTransaction } from '@modules/finance/pos/virtual/domain/entities/iyzico-transaction.entity';

@CommandHandler(HandlePaymentCallbackCommand)
export class HandlePaymentCallbackHandler
  implements
    ICommandHandler<
      HandlePaymentCallbackCommand,
      HandlePaymentCallbackCommandResponse
    >
{
  private readonly logger = new Logger(HandlePaymentCallbackHandler.name);

  constructor(
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(IYZICO_TRANSACTION_QUERY_REPOSITORY)
    private readonly iyzicoQueryRepo: IIyzicoTransactionQueryRepository,
    @Inject(IYZICO_TRANSACTION_COMMAND_REPOSITORY)
    private readonly iyzicoCommandRepo: IIyzicoTransactionCommandRepository,
    private readonly txManager: TransactionManager,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(
    command: HandlePaymentCallbackCommand
  ): Promise<HandlePaymentCallbackCommandResponse> {
    const { conversationId, token } = command;
    const sdkResult = await this.iyzicoProvider.retrieveCheckoutForm(token);

    await this.txManager.outboxRun(async () => {
      const iyzicoTx =
        await this.iyzicoQueryRepo.findTransactionByConversationId(
          conversationId
        );

      if (!iyzicoTx) {
        throw new IyzicoTransactionNotFoundException(conversationId);
      }

      const transaction = new IyzicoTransaction(iyzicoTx);

      // Idempotency: başarıyla işlenmiş bir işlem callback/webhook yarışında tekrar gelirse yok say.
      if (transaction.isSuccess()) {
        this.logger.warn(
          `Ödeme zaten önceden işlenmiş (Idempotency). conversationId=${conversationId}`
        );
        return;
      }

      const installment = iyzicoTx.installment;
      const payment = installment.payment;

      if (sdkResult.isSuccess) {
        transaction.markAsSuccess({
          iyzicoPaymentId: sdkResult.paymentId,
          iyzicoPaymentTransactionId: sdkResult.paymentTransactionId,
          rawResponse: sdkResult.rawResponse,
        });
        await this.iyzicoCommandRepo.save(transaction);

        // Taksit COMPLETED + PaymentPaidEvent payment command handler'ında fırlatılır.
        await this.commandBus.execute(
          new MarkInstallmentAsPaidCommand(installment.id, 'Ödeme Başarılı')
        );

        // Muhasebe köprüsü: cari garanti + ekonomik olay (aynı outboxRun → atomik).
        await this.recordPaymentReceived({
          patientId: payment.patientId,
          clinicId: payment.clinicId,
          installmentId: installment.id,
          paymentId: payment.id,
          amount: installment.amount.toString(),
          method: installment.method,
        });
      } else {
        transaction.markAsFailed({
          errorCode: sdkResult.errorCode,
          errorMessage: sdkResult.errorMessage,
          rawResponse: sdkResult.rawResponse,
        });
        await this.iyzicoCommandRepo.save(transaction);

        // Taksit PENDING'e döner + PaymentFailedEvent payment command handler'ında fırlatılır.
        await this.commandBus.execute(
          new MarkInstallmentAsFailedCommand(
            installment.id,
            sdkResult.errorMessage
          )
        );
      }
    });
  }

  /**
   * Tahsilatı muhasebe katmanına köprüler: hastanın carisini garanti eder ve
   * PAYMENT_RECEIVED ekonomik olayını yazar. dedupeKey ile idempotenttir; olay
   * Outbox'a düşer, posting listener'ı fişi (108/120) asenkron üretir.
   */
  private async recordPaymentReceived(
    input: RecordPaymentReceivedInput
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
            payload: {
              method: this.mapToCashMethod(input.method),
              amount: input.amount,
              partyId,
            },
            sourceModule: 'payment',
            sourceRefId: input.paymentId,
            dedupeKey: `payment-received:${input.installmentId}`,
          },
          ctx
        )
      );
    } catch (error) {
      // Köprü hatası tahsilatı bozmamalı; olay sonradan yeniden üretilebilir.
      this.logger.error(
        `Muhasebe köprüsü başarısız: installmentId=${input.installmentId}`,
        error
      );
    }
  }

  /** Prisma PaymentMethod → posting kuralının beklediği kasa/banka/POS biçimi. */
  private mapToCashMethod(
    method: PaymentMethod
  ): 'CASH' | 'BANK_TRANSFER' | 'POS_CARD' {
    switch (method) {
      case PaymentMethodSchema.enum.CASH:
        return 'CASH';
      case PaymentMethodSchema.enum.BANK_TRANSFER:
      case PaymentMethodSchema.enum.EFT:
        return 'BANK_TRANSFER';
      default:
        return 'POS_CARD';
    }
  }
}

interface RecordPaymentReceivedInput {
  patientId: string;
  clinicId: string;
  installmentId: string;
  paymentId: string;
  amount: string;
  method: PaymentMethod;
}
