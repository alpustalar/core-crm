import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentLinkModule } from '@src/infrastructure/payment/links/payment-link.module';
import { IyzicoModule } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/iyzico.module';
import { BookingPaymentRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/booking-payment/booking-payment.repository.module';
import { InitiateBookingPaymentHandler } from './initiate-booking-payment/initiate-booking-payment.handler';
import { ConfirmBookingPaymentHandler } from './confirm-booking-payment/confirm-booking-payment.handler';
import { HandleBookingPaymentIyzicoCallbackHandler } from './handle-iyzico-callback/handle-iyzico-callback.handler';
import { RefundBookingPaymentHandler } from './refund-booking-payment/refund-booking-payment.handler';

export const BOOKING_PAYMENT_COMMAND_HANDLERS = [
  InitiateBookingPaymentHandler,
  ConfirmBookingPaymentHandler,
  HandleBookingPaymentIyzicoCallbackHandler,
  RefundBookingPaymentHandler,
];

@Module({
  imports: [
    CqrsModule,
    PaymentLinkModule,
    IyzicoModule,
    BookingPaymentRepositoryModule,
  ],
  providers: BOOKING_PAYMENT_COMMAND_HANDLERS,
  exports: BOOKING_PAYMENT_COMMAND_HANDLERS,
})
export class BookingPaymentCommandModule {}
