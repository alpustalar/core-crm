import { BaseRules } from '@common/domain/rules/base.rules';
import PaymentStatusSchema from '@input-type-schemas/PaymentStatusSchema';
import { Payment } from '@modules/finance/payment/domain/entities/payment.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import {
  PaymentNotCancellableException,
  PaymentNotRefundableException,
} from '@modules/finance/payment/domain/exceptions/payment.exceptions';

export class PaymentRules extends BaseRules {
  constructor(
    private readonly payment: Payment,
    public readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  canCancel() {
    return this.evaluate(
      !this.payment.validate.status.isCompleted &&
        !this.payment.validate.status.isRefunded,
      () => new PaymentNotCancellableException(this.payment.status),
      this.validateOptions
    );
  }

  canRefund() {
    return this.evaluate(
      !this.payment.validate.status.isCompleted &&
        !this.payment.validate.status.isRefunded,
      () => new PaymentNotRefundableException(this.payment.status),
      this.validateOptions
    );
  }

  private assertCompleted() {
    /*  const error = isRefund
      ? new PaymentNotRefundableException(this.payment.status)
      : new PaymentNotCancellableException(this.payment.status);*/

    return this.payment.status === PaymentStatusSchema.enum.COMPLETED;
  }
}
