import { ICommand } from '@nestjs/cqrs';
import { BookingPaymentProviderValue } from '@modules/crm/health-tourism/booking-payment/domain/contracts/booking-payment.contracts';
import { IGetContext } from '@common/decorators';

export interface ConfirmBookingPaymentInput {
  bookingPaymentId: string;
  provider: BookingPaymentProviderValue;
  /** İade için sağlayıcı ödeme referansı: iyzico paymentTransactionId / stripe payment_intent. */
  providerRef: string;
  ctx: IGetContext;
}

/**
 * Ödeme onaylandığında (Stripe webhook / iyzico callback) tetiklenir: BookingPayment'ı PAID
 * yapar, diğer linki expire eder, intent'i HotelBeds'e replay eder (book). Çift-çekimde ikinci
 * ödeme iade edilir; book başarısızsa ödeme iade edilir.
 */
export class ConfirmBookingPaymentCommand implements ICommand {
  constructor(public readonly input: ConfirmBookingPaymentInput) {}
}
