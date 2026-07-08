import { BookingPayment } from '../entities/booking-payment.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const BOOKING_PAYMENT_COMMAND_REPOSITORY = Symbol(
  'IBookingPaymentCommandRepository'
);
export const BOOKING_PAYMENT_QUERY_REPOSITORY = Symbol(
  'IBookingPaymentQueryRepository'
);

export type IBookingPaymentCommandRepository =
  IBaseCommandRepository<BookingPayment>;

export interface IBookingPaymentQueryRepository {
  findById(id: string): Promise<BookingPayment | null>;
  findByStripeSessionId(sessionId: string): Promise<BookingPayment | null>;
  findByIyzicoConversationId(
    conversationId: string
  ): Promise<BookingPayment | null>;
  /** Rezervasyon sonucu (dahili booking id) ile bulur — iptal/iade akışı için. */
  findByBookingId(bookingId: string): Promise<BookingPayment | null>;
}
