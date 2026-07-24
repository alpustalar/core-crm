import { BaseRules } from '@common/domain/rules/base.rules';
import { Activity } from '@modules/crm/activity/domain/entities/activity.entity';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { ActivityStatusSchema, ActivityTypeSchema } from '@shared';
import { ActivityInvalidCompletionException } from '@modules/crm/activity/domain/exceptions/activity.exceptions';

export class ActivityRules extends BaseRules {
  constructor(
    private readonly activity: Activity,
    private readonly validateOptions: ValidateOptionsType = DefaultValidateOptions
  ) {
    super();
  }

  /** NOT tamamlanamaz; zaten sonuçlanmış (COMPLETED/CANCELLED) aktivite tekrar tamamlanamaz. */

  public complete() {
    let isInvalid = true;
    let error: Error;
    if (this.activity.type === ActivityTypeSchema.enum.NOTE) {
      error = new ActivityInvalidCompletionException(
        'Not tipindeki aktivite tamamlanamaz.'
      );
      isInvalid = false;
    }
    if (this.activity.status !== ActivityStatusSchema.enum.PENDING) {
      error = new ActivityInvalidCompletionException(
        'Yalnızca bekleyen aktiviteler tamamlanabilir.'
      );
      isInvalid = false;
    }

    return this.evaluate(!isInvalid, () => error, this.validateOptions);
  }
}
