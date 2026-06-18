import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetPaymentWithInstallmentsHandler } from './get-payment-with-installments/get-payment-with-installments.handler';
import { GetPaymentByAppointmentIdHandler } from './get-payment-by-appointment-id/get-payment-by-appointment-id.handler';
import { GetArAgingHandler } from './get-ar-aging/get-ar-aging.handler';
import { GetProviderRevenueHandler } from './get-provider-revenue/get-provider-revenue.handler';
import { PaymentRepositoryModule } from '@modules/finance/payment/infrastructure/persistence/prisma/repositories/payment.repository.module';

const QueryHandlers = [
  GetPaymentWithInstallmentsHandler,
  GetPaymentByAppointmentIdHandler,
  GetArAgingHandler,
  GetProviderRevenueHandler,
];

@Module({
  imports: [CqrsModule, PaymentRepositoryModule],
  providers: QueryHandlers,
})
export class PaymentQueryModule {}
