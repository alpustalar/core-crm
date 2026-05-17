import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PaymentRepository } from '@modules/payment/infrastructure/persistence/prisma/repositories';
import { IyzicoProvider } from '@src/infrastructure/payment/providers/iyzico/iyzico.provider';
import { PaymentEventPublisher } from '@modules/payment/infrastructure/events/payment-event-publisher.service';
import { PaymentDomainService } from '@modules/payment/domain/services/payment-domain.service';
import { PAYMENT_ACTIONS } from '@modules/payment/domain/constants/payment.constant';

interface CancelPaymentInput {
  paymentId: string;
  ip: string;
}

@Injectable()
export class CancelPaymentUseCase {
  private readonly logger = new Logger(CancelPaymentUseCase.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly txManager: TransactionManager,
    private readonly iyzicoProvider: IyzicoProvider,
    private readonly paymentEventPublisher: PaymentEventPublisher,
    private readonly paymentDomainService: PaymentDomainService
  ) {}

  async execute({ paymentId, ip }: CancelPaymentInput): Promise<void> {
    const payment =
      await this.paymentRepo.findPaymentWithTransaction(paymentId);

    if (!payment) {
      throw new NotFoundException(`Ödeme bulunamadı: paymentId=${paymentId}`);
    }

    this.paymentDomainService.paymentIsCompleteOrThrow(payment);

    const iyzicoTransaction = payment.iyzicoTransaction;

    if (!iyzicoTransaction?.iyzicoPaymentId) {
      throw new BadRequestException(
        `Bu ödeme için iyzico işlem kaydı bulunamadı.`
      );
    }

    const conversationId = randomUUID();

    const sdkResult = await this.iyzicoProvider.cancelPayment({
      conversationId,
      paymentId: iyzicoTransaction.iyzicoPaymentId,
      ip,
    });

    this.paymentDomainService.checkIyzicoSdkStatusOrThrow({
      status: sdkResult.status,
      paymentId,
      conversationId,
      sdkErrorMessage: sdkResult?.errorMessage,
      action: PAYMENT_ACTIONS.CANCEL,
    });

    await this.txManager.run(async () => {
      await this.paymentRepo.markAsCancelled(payment.id);

      // TODO: this.paymentEventPublisher.paymentCancelled({});
    });

    this.logger.log(`Ödeme iptali başarılı`, { paymentId });
  }
}
