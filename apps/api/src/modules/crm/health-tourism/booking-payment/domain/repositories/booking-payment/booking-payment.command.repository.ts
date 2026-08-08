import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';

export const BOOKING_PAYMENT_COMMAND_REPOSITORY = Symbol(
  'IBookingPaymentCommandRepository'
);
export interface IBookingPaymentCommandRepository
  extends IBaseCommandRepository<BookingPayment> {
  /** Rezervasyon sonucu (dahili booking id) ile bulur — iptal/iade akışı için. */
  findByBookingId(bookingId: string): Promise<BookingPayment | null>;
}
