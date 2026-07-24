import { QueryResponse } from '@shared/common/response/response.interface';
import {
  BookingPaymentStatusValue,
  BookingPaymentTypeValue,
} from '@modules/crm/health-tourism/booking-payment/domain/contracts/booking-payment.contracts';

export interface BookingPaymentStatusView {
  id: string;
  bookingType: BookingPaymentTypeValue;
  status: BookingPaymentStatusValue;
  bookingReference: string | null;
  saleAmount: number;
  saleCurrency: string;
}

export type GetBookingPaymentResponse =
  QueryResponse<BookingPaymentStatusView | null>;
