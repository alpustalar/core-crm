import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { IyzicoProvider } from '@src/infrastructure/persistence/payment/providers/iyzico/iyzico.provider';
import { PaymentRepository } from '@modules/payment/infrastructure/persistence/prisma/repositories';
import { PaymentDomainService } from '@modules/payment/domain/services/payment-domain.service';
import { PaymentEventPublisher } from '@modules/payment/infrastructure/events/publisher/payment.publisher';
import { IyzicoTransactionRepository } from '@src/infrastructure/persistence/payment/providers/iyzico/repositories/iyzico-transaction.repository';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

export interface HandleCallbackInput {
  token: string;
  conversationId: string;
  signature: string;
}

@Injectable()
export class HandlePaymentCallbackUseCase {
  private readonly logger = new Logger(HandlePaymentCallbackUseCase.name);

  constructor(
    private readonly iyzicoProvider: IyzicoProvider,
    private readonly iyzicoRepo: IyzicoTransactionRepository,
    private readonly paymentRepo: PaymentRepository,
    private readonly txManager: TransactionManager,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly paymentEventPublisher: PaymentEventPublisher
  ) {}

  async execute({ token, conversationId }: HandleCallbackInput): Promise<void> {
    const sdkResult = await this.iyzicoProvider.retrieveCheckoutForm(token);

    await this.txManager.run(async () => {
      const iyzicoTx =
        await this.iyzicoRepo.findTransactionByConversationId(conversationId);

      if (!iyzicoTx) {
        this.logger.error(`Ödeme kaydı bulunamadı`, { conversationId });
        throw new NotFoundException(
          `Ödeme kaydı bulunamadı: conversationId=${conversationId}`
        );
      }

      if (
        this.paymentDomainService.isAlreadyProcessed(iyzicoTx, conversationId)
      ) {
        return;
      }

      const payment = iyzicoTx.payment;
      const eventBase = {
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

        await this.paymentRepo.markAsSuccess(payment.id);

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
        await this.paymentRepo.markAsFailed(payment.id);

        this.paymentEventPublisher.paymentFailed({
          ...eventBase,
          action: LogAction.PAYMENT_SUCCESS,
          type: LogType.ERROR,
          details: sdkResult.errorMessage,
        });

        this.logger.warn(`Ödeme başarısız`, {
          paymentId: payment.id,
          reason: sdkResult.errorMessage,
        });
      }
    });
  }
}
