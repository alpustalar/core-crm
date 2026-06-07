import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HandlePaymentCallbackCommand } from './handle-payment-callback.command';
import { HandlePaymentCallbackCommandResponse } from './handle-payment-callback.response';
import {
  IIyzicoTransactionRepository,
  IYZICO_TRANSACTION_REPOSITORY,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico-transaction.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  IPaymentEventPublisher,
  PAYMENT_EVENT_PUBLISHER,
} from '@modules/finance/payment/domain/interfaces/payment-event-publisher.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import { PaymentDomainService } from '@modules/finance/payment/domain/services/payment-domain.service';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { MarkInstallmentAsPaidCommand } from '@modules/finance/payment/application/commands/mark-installment-as-paid/mark-installment-as-paid.command';
import { MarkInstallmentAsFailedCommand } from '@modules/finance/payment/application/commands/mark-installment-as-failed/mark-installment-as-failed.command';

@CommandHandler(HandlePaymentCallbackCommand)
export class HandlePaymentCallbackHandler
  implements
    ICommandHandler<
      HandlePaymentCallbackCommand,
      HandlePaymentCallbackCommandResponse
    >
{
  constructor(
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider,
    @Inject(IYZICO_TRANSACTION_REPOSITORY)
    private readonly iyzicoRepo: IIyzicoTransactionRepository,
    @Inject(PAYMENT_EVENT_PUBLISHER)
    private readonly paymentEventPublisher: IPaymentEventPublisher,
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
      const eventBase = {
        installmentId: installment.id,
        paymentId: payment.id,
        appointmentId: payment.appointmentId,
        clinicId: payment.clinicId,
      };

      if (sdkResult.isSuccess) {
        await this.iyzicoRepo.markAsSuccess({
          iyzicoTransactionId: iyzicoTx.id,
          iyzicoPaymentId: sdkResult.paymentId,
          iyzicoPaymentTransactionId: sdkResult.paymentTransactionId,
          rawResponse: sdkResult.rawResponse,
        });

        await this.commandBus.execute(
          new MarkInstallmentAsPaidCommand(installment.id)
        );

        this.paymentEventPublisher.paymentPaid({
          ...eventBase,
          action: LogAction.PAYMENT_SUCCESS,
          type: LogType.INFO,
          details: 'Ödeme Başarılı',
        });
      } else {
        await this.iyzicoRepo.markAsFailed({
          iyzicoTransactionId: iyzicoTx.id,
          errorCode: sdkResult.errorCode,
          errorMessage: sdkResult.errorMessage,
          rawResponse: sdkResult.rawResponse,
        });

        await this.commandBus.execute(
          new MarkInstallmentAsFailedCommand(installment.id)
        );

        this.paymentEventPublisher.paymentFailed({
          ...eventBase,
          action: LogAction.PAYMENT_SUCCESS,
          type: LogType.ERROR,
          details: sdkResult.errorMessage,
        });
      }
    });
  }
}
