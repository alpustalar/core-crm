import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePaymentHandler } from './create-payment/create-payment.handler';
import { CreatePaymentPlanHandler } from './create-payment-plan/create-payment-plan.handler';
import { MarkInstallmentAsPaidHandler } from './mark-installment-as-paid/mark-installment-as-paid.handler';
import { MarkInstallmentAsFailedHandler } from './mark-installment-as-failed/mark-installment-as-failed.handler';
import { MarkInstallmentAsCancelledHandler } from './mark-installment-as-cancelled/mark-installment-as-cancelled.handler';
import { MarkInstallmentAsRefundedHandler } from './mark-installment-as-refunded/mark-installment-as-refunded.handler';
import { PaymentEventModule } from '@modules/finance/payment/infrastructure/events/payment-event.module';
import { PaymentRepositoryModule } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/payment.repository.module';

const CommandHandlers = [
  CreatePaymentHandler,
  CreatePaymentPlanHandler,
  MarkInstallmentAsPaidHandler,
  MarkInstallmentAsFailedHandler,
  MarkInstallmentAsCancelledHandler,
  MarkInstallmentAsRefundedHandler,
];

@Module({
  imports: [CqrsModule, PaymentEventModule, PaymentRepositoryModule],
  providers: CommandHandlers,
})
export class PaymentCommandModule {}
