import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PaymentRepository } from '@modules/payment/infrastructure/persistence/prisma/repositories';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { InitCheckoutFormDto } from '@shared';
import { IyzicoProvider } from '@src/infrastructure/payment/providers/iyzico/iyzico.provider';
import { PaymentEventPublisher } from '@modules/payment/infrastructure/events/payment-event-publisher.service';
import { IyzicoMapper } from '@src/infrastructure/payment/providers/iyzico';
import { IyzicoTransactionRepository } from '@src/infrastructure/payment/providers/iyzico/repositories/iyzico-transaction.repository';
import { LogAction, LogType } from '@src/domain/constants/log-action.constant';

export interface InitCheckoutFormInput extends InitCheckoutFormDto {
  callbackIp: string;
}

@Injectable()
export class InitCheckoutFormUseCase {
  private readonly logger = new Logger(InitCheckoutFormUseCase.name);

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly txManager: TransactionManager,
    private readonly iyzicoProvider: IyzicoProvider,
    private readonly iyzicoTransactionRepo: IyzicoTransactionRepository,
    private readonly paymentEventPublisher: PaymentEventPublisher
  ) {}

  async execute(input: InitCheckoutFormInput) {
    const conversationId = randomUUID();

    return await this.txManager.run(async () => {
      const payment = await this.paymentRepo.createPayment({
        clinicId: input.clinicId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
        expectedAmount: input.amount,
        currency: 'TRY',
      });

      const iyzicoCallbackUrl = this.iyzicoProvider.getCallbackUrl();

      const request = IyzicoMapper.toInitializeCheckoutFormRequest({
        input: { ...input, paymentId: payment.id },
        conversationId,
        callbackUrl: iyzicoCallbackUrl,
      });

      const sdkResult = await this.iyzicoProvider.paymentInitialize(request);

      const iyzico = await this.iyzicoTransactionRepo.createTransaction({
        paymentId: payment.id,
        conversationId,
        token: sdkResult.token,
      });

      if (!iyzico) {
        this.logger.error(`Checkout form başlatılamadı`, {
          conversationId,
          paymentId: payment.id,
        });
        throw new BadRequestException(`Ödeme formu oluşturulamadı:`);
      }

      this.paymentEventPublisher.paymentInitiated({
        paymentId: payment.id,
        token: sdkResult.token,
        appointmentId: input.appointmentId,
        action: LogAction.PAYMENT_INITIATED,
        type: LogType.INFO,
      });

      return {
        paymentPageUrl: sdkResult.paymentPageUrl!,
        conversationId,
      };
    });
  }
}
