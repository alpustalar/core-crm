import { BaseRules } from '@common/domain/rules/base.rules';
import { BookingPayment } from '@modules/crm/health-tourism/booking-payment/domain/entities/booking-payment.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { BookingPaymentStatusSchema } from '@shared';

export class BookingPaymentRules extends BaseRules {
  constructor(
    private readonly bookingPayment: BookingPayment,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  markPaid() {
    const isValid = this.bookingPayment.validate.status.isPending.value;
    return this.evaluate(
      isValid,
      () =>
        new Error(
          `Ödeme yalnız "bekleyen" durumda "ödendi" olarak işaretlenebilir (mevcut: ${this.bookingPayment.status}).`
        ),
      this.validateOptions
    );
  }

  markBooked() {
    const isInvalid =
      this.bookingPayment.status !== BookingPaymentStatusSchema.enum.PAID;

    return this.evaluate(
      !isInvalid,
      () =>
        new Error(
          `Rezervasyon yalnız PAID durumunda tamamlanabilir (mevcut: ${this.bookingPayment.status}).`
        ),
      this.validateOptions
    );
  }

  markExpired() {
    const isInvalid =
      this.bookingPayment.status !== BookingPaymentStatusSchema.enum.PENDING;

    return this.evaluate(
      !isInvalid,
      () =>
        new Error(
          `Yalnız PENDING durumundaki kayıt expire edilebilir (mevcut: ${this.bookingPayment.status}).`
        ),
      this.validateOptions
    );
  }
}
