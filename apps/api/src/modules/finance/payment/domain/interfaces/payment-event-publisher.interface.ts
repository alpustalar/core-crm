import { PaymentPaidEventPayload } from '@modules/finance/payment/domain/events/payment-paid.event';
import { PaymentRefundedEventPayload } from '@modules/finance/payment/domain/events/payment-refunded.event';
import { PaymentFailedPayload } from '@modules/finance/payment/domain/events/payment-failed.event';
import { PaymentInitiatedEventPayload } from '@modules/finance/payment/domain/events/payment-initiated.event';
import { PaymentCancelledEventPayload } from '@modules/finance/payment/domain/events/payment-cancelled.event';

export const PAYMENT_EVENT_PUBLISHER = Symbol('IPaymentEventPublisher');
export interface IPaymentEventPublisher {
  /**
   * Ödeme başarıyla tamamlandığında tetiklenir.
   */
  paymentPaid(payload: PaymentPaidEventPayload): void;

  /**
   * Ödeme iade edildiğinde tetiklenir.
   */
  paymentRefund(payload: PaymentRefundedEventPayload): void;

  /**
   * Ödeme işlemi başarısız olduğunda tetiklenir.
   */
  paymentFailed(payload: PaymentFailedPayload): void;

  /**
   * Ödeme işlemi başlatıldığında tetiklenir.
   */
  paymentInitiated(payload: PaymentInitiatedEventPayload): void;

  /**
   * Ödeme işlemi kullanıcı veya sistem tarafından iptal edildiğinde tetiklenir.
   */
  paymentCancelled(payload: PaymentCancelledEventPayload): void;
}
