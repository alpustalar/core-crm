import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentPaidInvoiceListener } from './listeners/payment-paid.listener';
import { AppointmentCompletedInvoiceListener } from './listeners/appointment-completed.listener';

@Module({
  imports: [CqrsModule],
  providers: [PaymentPaidInvoiceListener, AppointmentCompletedInvoiceListener],
})
export class InvoiceEventModule {}
