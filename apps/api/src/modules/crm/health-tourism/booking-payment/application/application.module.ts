import { Module } from '@nestjs/common';
import { BookingPaymentQueryModule } from '@modules/crm/health-tourism/booking-payment/application/queries/query.module';
import { BookingPaymentCommandModule } from '@modules/crm/health-tourism/booking-payment/application/commands/command.module';

const ApplicationModules = [
  BookingPaymentQueryModule,
  BookingPaymentCommandModule,
];

@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class BookingPaymentApplicationModule {}
