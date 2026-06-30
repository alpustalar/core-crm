import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BookingPaymentRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/booking-payment/booking-payment.repository.module';
import { GetBookingPaymentHandler } from './get-booking-payment/get-booking-payment.handler';

export const BOOKING_PAYMENT_QUERY_HANDLERS = [GetBookingPaymentHandler];

@Module({
  imports: [CqrsModule, BookingPaymentRepositoryModule],
  providers: BOOKING_PAYMENT_QUERY_HANDLERS,
  exports: BOOKING_PAYMENT_QUERY_HANDLERS,
})
export class BookingPaymentQueryModule {}
