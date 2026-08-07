import { BookingPayment } from '@shared';

export const BOOKING_PAYMENT_QUERY_REPOSITORY = Symbol(
  'IBookingPaymentQueryRepository'
);

export interface IBookingPaymentQueryRepository {
  findById(id: string): Promise<BookingPayment | null>;
  findByStripeSessionId(sessionId: string): Promise<BookingPayment | null>;
  findByIyzicoConversationId(
    conversationId: string
  ): Promise<BookingPayment | null>;
}
