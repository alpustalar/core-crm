import { IQuery } from '@nestjs/cqrs';
import { GetBookingPaymentResponse } from './get-booking-payment.response';

export class GetBookingPaymentQuery implements IQuery {
  readonly __responseType!: GetBookingPaymentResponse;

  constructor(public readonly bookingPaymentId: string) {}
}
