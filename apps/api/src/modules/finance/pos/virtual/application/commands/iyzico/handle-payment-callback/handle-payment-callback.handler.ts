import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandlePaymentCallbackCommand } from './handle-payment-callback.command';
import { HandlePaymentCallbackCommandResponse } from './handle-payment-callback.response';
import {
  IIyzicoTransactionRepository,
  IYZICO_TRANSACTION_REPOSITORY,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico-transaction.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import { PaymentDomainService } from '@modules/finance/payment/domain/services/payment-domain.service';
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
    @Inject(IYZICO_TRANSACTION_REPOSITORY)
    private readonly iyzicoRepo: IIyzicoTransactionRepository,
    private readonly txManager: TransactionManager,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly commandBus: TSCommandBus
  ) {}

  async execute(
    command: HandlePaymentCallbackCommand
  ): Promise<HandlePaymentCallbackCommandResponse> {
    const { conversationId, token } = command;
    const sdkResult = await this.iyzicoProvider.retrieveCheckoutForm(token);

    await this.txManager.outboxRun(async () => {
      const iyzicoTx =
        await this.iyzicoRepo.findTransactionByConversationId(conversationId);

      if (!iyzicoTx) {
        throw new NotFoundException(
          `Ödeme kaydı bulunamadı: conversationId=${conversationId}`
        );
      }

      if (
        this.paymentDomainService.isAlreadyProcessed(iyzicoTx, conversationId)
      ) {
        return;
      }

      const installment = iyzicoTx.installment;
      const payment = installment.payment;

      if (sdkResult.isSuccess) {
        await this.iyzicoRepo.markAsSuccess({
          iyzicoTransactionId: iyzicoTx.id,
          iyzicoPaymentId: sdkResult.paymentId,
          iyzicoPaymentTransactionId: sdkResult.paymentTransactionId,
          rawResponse: sdkResult.rawResponse,
        });

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
        await this.iyzicoRepo.markAsFailed({
          iyzicoTransactionId: iyzicoTx.id,
          errorCode: sdkResult.errorCode,
          errorMessage: sdkResult.errorMessage,
          rawResponse: sdkResult.rawResponse,
        });

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
