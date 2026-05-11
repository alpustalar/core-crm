import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { PaymentRepository } from '@modules/payment/infrastructure/persistence/prisma/repositories';
import { IyzicoProvider } from '@src/infrastructure/persistence/payment/providers/iyzico/iyzico.provider';
import { PaymentDomainService } from '@modules/payment/domain/services/payment-domain.service';
import { PaymentEventPublisher } from '@modules/payment/infrastructure/events/publisher/payment.publisher';
import { PAYMENT_ACTIONS } from '@modules/payment/domain/constants/payment.constant';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

interface RefundPaymentInput {
  paymentId: string;
  ip: string;
}

@Injectable()
export class RefundPaymentUseCase {
  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly txManager: TransactionManager,
    private readonly iyzicoProvider: IyzicoProvider,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly paymentEventPublisher: PaymentEventPublisher
  ) {}

  async execute({ paymentId, ip }: RefundPaymentInput) {
    const payment =
      await this.paymentRepo.findPaymentWithTransaction(paymentId);

    if (!payment) {
      throw new NotFoundException(`Ödeme bulunamadı: paymentId=${paymentId}`);
    }
    this.paymentDomainService.validateRefundEligibilityOrThrow(payment);

    const iyzicoTransaction = payment.iyzicoTransaction;

    if (!iyzicoTransaction?.iyzicoPaymentTransactionId) {
      throw new BadRequestException(
        `Bu ödeme için iyzico işlem transaction kaydı bulunamadı.`
      );
    }

    const conversationId = randomUUID();

    const sdkResult = await this.iyzicoProvider.refund({
      locale: 'TR',
      conversationId,
      paymentTransactionId: iyzicoTransaction.iyzicoPaymentTransactionId,
      price: payment.expectedAmount.toString(),
      ip,
      currency: 'TRY',
    });

    this.paymentDomainService.checkIyzicoSdkStatusOrThrow({
      paymentId,
      conversationId,
      action: PAYMENT_ACTIONS.REFUND,
      sdkErrorMessage: sdkResult.errorMessage,
      status: sdkResult.status,
    });

    await this.txManager.run(async () => {
      await this.paymentRepo.markAsRefunded({
        paymentId: payment.id,
        iyzicoTransactionId: iyzicoTransaction.id,
        rawResponse: sdkResult as unknown as Prisma.InputJsonValue,
      });

      this.paymentEventPublisher.paymentRefund({
        paymentId: payment.id,
        appointmentId: payment.appointmentId ?? null,
        clinicId: payment.clinicId,
        action: LogAction.PAYMENT_REFUNDED,
        type: LogType.INFO,
        details: '',
      });
    });
  }
}
