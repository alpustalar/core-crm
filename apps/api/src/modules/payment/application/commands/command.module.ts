import { CreatePaymentPlanHandler } from '@modules/payment/application/commands/payment/create-payment-plan/create-payment-plan.handler';
import { RefundPaymentHandler } from '@modules/payment/application/commands/iyzico/refund-payment/refund-payment.handler';
import { InitCheckoutFormHandler } from '@modules/payment/application/commands/iyzico/init-checkout-form/init-checkout-form.handler';
import { HandlePaymentCallbackHandler } from '@modules/payment/application/commands/iyzico/handle-payment-callback/handle-payment-callback.handler';
import { Module } from '@nestjs/common';
import { CancelPaymentHandler } from '@modules/payment/application/commands/iyzico/cancel-payment/cancel-payment.handler';
import { PAYMENT_REPOSITORY } from '@modules/payment/domain/repositories/payment.repository.interface';
import { PaymentRepository } from '@modules/payment/infrastructure/persistence/prisma/repositories';
import { IyzicoModule } from '@src/infrastructure/payment/providers/iyzico/iyzico.module';
import { PaymentDomainService } from '@modules/payment/domain/services/payment-domain.service';
import { PaymentEventModule } from '@modules/payment/infrastructure/events/payment-event.module';

const CommandHandlers = [
  CreatePaymentPlanHandler,
  RefundPaymentHandler,
  InitCheckoutFormHandler,
  HandlePaymentCallbackHandler,
  CancelPaymentHandler,
];

@Module({
  imports: [IyzicoModule, PaymentEventModule],
  providers: [
    ...CommandHandlers,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
    PaymentDomainService,
  ],
  exports: [...CommandHandlers],
})
export class PaymentCommandModule {}
