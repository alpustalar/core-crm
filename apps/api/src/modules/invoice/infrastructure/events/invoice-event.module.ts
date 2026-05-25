import { Module } from '@nestjs/common';
import { PaymentPaidInvoiceListener } from './listeners/payment-paid.listener';
import { AppointmentCompletedInvoiceListener } from './listeners/appointment-completed.listener';

@Module({
  providers: [PaymentPaidInvoiceListener, AppointmentCompletedInvoiceListener],
})
export class InvoiceEventModule {}
