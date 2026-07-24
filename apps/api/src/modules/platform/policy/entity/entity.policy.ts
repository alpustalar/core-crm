import { Injectable } from '@nestjs/common';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';
import { BasePolicy } from '@modules/platform/policy/staff/application/base.policy';
import { IEntityPolicy } from '@modules/platform/policy/entity/entity-policy.interface';

@Injectable()
export class EntityPolicy extends BasePolicy implements IEntityPolicy {
  public getValidateOptions(businessRulesEnabled = true): ValidateOptionsType {
    return {
      systemOverride: this.isSystem(),
      businessRulesEnabled,
    };
  }
}
