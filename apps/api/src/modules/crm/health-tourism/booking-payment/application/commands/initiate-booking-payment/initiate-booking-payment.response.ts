/** Tek bir ödeme linki seçeneği (sağlayıcı + tutar + para birimi + URL). */
export interface BookingPaymentLinkOption {
  url: string;
  amount: number;
  currency: string;
}

export interface InitiateBookingPaymentResponse {
  bookingPaymentId: string;
  saleAmount: number;
  saleCurrency: string;
  /** iyzico — TRY (yurt içi); FX kuru çözülemezse null. */
  iyzico: BookingPaymentLinkOption | null;
  /** Stripe — EUR/USD (yurt dışı); satış TRY ise null. */
  stripe: BookingPaymentLinkOption | null;
}
