import { Module } from '@nestjs/common';
import { BookingPaymentCommandRepository } from './booking-payment.command.repository';
import { BookingPaymentQueryRepository } from './booking-payment.query.repository';
import { BOOKING_PAYMENT_COMMAND_REPOSITORY } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment/booking-payment.command.repository';
import { BOOKING_PAYMENT_QUERY_REPOSITORY } from '@modules/crm/health-tourism/booking-payment/domain/repositories/booking-payment/booking-payment.query.repository';

@Module({
  providers: [
    {
      provide: BOOKING_PAYMENT_COMMAND_REPOSITORY,
      useClass: BookingPaymentCommandRepository,
    },
    {
      provide: BOOKING_PAYMENT_QUERY_REPOSITORY,
      useClass: BookingPaymentQueryRepository,
    },
  ],
  exports: [
    BOOKING_PAYMENT_COMMAND_REPOSITORY,
    BOOKING_PAYMENT_QUERY_REPOSITORY,
  ],
})
export class BookingPaymentRepositoryModule {}
