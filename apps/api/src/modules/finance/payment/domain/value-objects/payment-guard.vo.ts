import PaymentStatusSchema, {
  PaymentStatusType,
} from '@input-type-schemas/PaymentStatusSchema';
import {
  PaymentNotCancellableException,
  PaymentNotRefundableException,
} from '@modules/finance/payment/domain/exceptions/payment.exceptions';

export interface PaymentGuardTarget {
  id: string;
  status: PaymentStatusType;
}

/**
 * Bir ödemenin durumu (status) üzerinden domain kurallarını denetleyen değer nesnesi.
 * Eski `PaymentDomainService.validate` getter'ının VO karşılığıdır: HTTP'den izole,
 * `DomainException` fırlatır ve `{ isValid, isInvalid, orThrow }` guard biçimini döner.
 *
 * Örn: `PaymentGuard.of(payment).validate.refundEligibility().orThrow()`
 */
export class PaymentGuard {
  private constructor(private readonly payment: PaymentGuardTarget) {}

  static of(payment: PaymentGuardTarget): PaymentGuard {
    return new PaymentGuard(payment);
  }

  public get validate() {
    return {
      /** İade edilebilirlik: yalnızca tamamlanmış (COMPLETED) ödeme iade edilebilir. */
      refundEligibility: () => this.assertCompleted(true),
      /** İptal edilebilirlik: yalnızca tamamlanmış (COMPLETED) ödeme iptal edilebilir. */
      isComplete: () => this.assertCompleted(false),
    };
  }

  private assertCompleted(isRefund: boolean) {
    const isValid =
      this.payment.status === PaymentStatusSchema.enum.COMPLETED;

    const error = isRefund
      ? new PaymentNotRefundableException(this.payment.status)
      : new PaymentNotCancellableException(this.payment.status);

    return {
      isValid,
      isInvalid: !isValid,
      orThrow: () => {
        if (!isValid) {
          throw error;
        }
      },
    };
  }
}
