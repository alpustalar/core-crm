import { Module } from '@nestjs/common';
import { BookingPaymentCommandModule } from './application/commands/command.module';
import { BookingPaymentQueryModule } from './application/queries/query.module';
import { BookingPaymentPresentationModule } from './presentation/booking-payment-presentation.module';

@Module({
  imports: [
    BookingPaymentCommandModule,
    BookingPaymentQueryModule,
    BookingPaymentPresentationModule,
  ],
  exports: [BookingPaymentCommandModule, BookingPaymentQueryModule],
})
export class BookingPaymentModule {}
