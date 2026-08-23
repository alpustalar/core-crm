import { BaseRules } from '@common/domain/rules/base.rules';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

export class SubscriptionRules extends BaseRules {
  constructor(
    public readonly subscription: Subscription,
    private readonly validateOptions: ValidateOptionsType
  ) {
    super();
  }

  scheduleCancellation() {
    const valid = this.subscription.validate.status.isActive().value;
    return this.evaluate(
      valid,
      () => new Error('Yalnızca aktif abonelikler iptal planlanabilir.'),
      this.validateOptions
    );
  }

  undoCancellation() {
    const valid = this.subscription.cancelAtPeriodEnd;
    return this.evaluate(
      valid,
      () =>
        new Error('İptal planlanmamış abonelik üzerinde geri alma yapılamaz.'),
      this.validateOptions
    );
  }

  cancel() {
    const valid = !this.subscription.validate.status.isCancelled().value;
    return this.evaluate(
      valid,
      () => new Error('Abonelik zaten iptal edildi.'),
      this.validateOptions
    );
  }
}
