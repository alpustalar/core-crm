import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePaymentHandler } from './create-payment/create-payment.handler';
import { CreatePaymentPlanHandler } from './create-payment-plan/create-payment-plan.handler';
import { MarkInstallmentAsPaidHandler } from './mark-installment-as-paid/mark-installment-as-paid.handler';
import { MarkInstallmentAsFailedHandler } from './mark-installment-as-failed/mark-installment-as-failed.handler';
import { MarkInstallmentAsCancelledHandler } from './mark-installment-as-cancelled/mark-installment-as-cancelled.handler';
import { MarkInstallmentAsRefundedHandler } from './mark-installment-as-refunded/mark-installment-as-refunded.handler';
import {
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { PaymentRepository } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/payment.repository';

const CommandHandlers = [
  CreatePaymentHandler,
  CreatePaymentPlanHandler,
  MarkInstallmentAsPaidHandler,
  MarkInstallmentAsFailedHandler,
  MarkInstallmentAsCancelledHandler,
  MarkInstallmentAsRefundedHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    { provide: PAYMENT_REPOSITORY, useClass: PaymentRepository },
  ],
  exports: CommandHandlers,
})
export class PaymentCommandModule {}
