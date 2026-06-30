import { ICommand } from '@nestjs/cqrs';
import {
  BookingIntent,
  BookingPaymentTypeValue,
  Currency,
} from '@modules/crm/health-tourism/booking-payment/domain/booking-payment.contracts';
import { InitiateBookingPaymentResponse } from './initiate-booking-payment.response';

export interface InitiateBookingPaymentBuyer {
  name: string;
  surname: string;
  email: string;
  phone: string;
}

export interface InitiateBookingPaymentInput {
  bookingType: BookingPaymentTypeValue;
  intent: BookingIntent;
  /** HotelBeds net maliyet (satış = net × (1 + serviceFeePercent/100)). */
  netAmount: number;
  netCurrency: Currency;
  serviceFeePercent: number;
  buyer: InitiateBookingPaymentBuyer;
  clinicId: string;
  organizationId: string;
  patientId: string | null;
  leadId: string | null;
  conversationId: string | null;
  ip: string;
}

/**
 * Sağlık turizmi rezervasyonu için ödeme-önce tahsilat başlatır: BookingPayment (PENDING)
 * oluşturur, iki link üretir (iyzico TRY + Stripe EUR/USD) ve ikisini birden döner.
 */
export class InitiateBookingPaymentCommand implements ICommand {
  readonly __responseType!: InitiateBookingPaymentResponse;

  constructor(public readonly input: InitiateBookingPaymentInput) {}
}
