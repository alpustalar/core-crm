import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPaymentWithInstallmentsHandler } from './get-payment-with-installments/get-payment-with-installments.handler';
import { GetArAgingHandler } from './get-ar-aging/get-ar-aging.handler';
import { GetProviderRevenueHandler } from './get-provider-revenue/get-provider-revenue.handler';
import {
  PAYMENT_REPOSITORY,
} from '@modules/finance/payment/domain/repositories/payment.repository.interface';
import { PaymentRepository } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/payment.repository';

const QueryHandlers = [
  GetPaymentWithInstallmentsHandler,
  GetArAgingHandler,
  GetProviderRevenueHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    ...QueryHandlers,
    { provide: PAYMENT_REPOSITORY, useClass: PaymentRepository },
  ],
  exports: QueryHandlers,
})
export class PaymentQueryModule {}
