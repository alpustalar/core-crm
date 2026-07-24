import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

export interface IEntityPolicy {
  getValidateOptions(businessRulesEnabled?: boolean): ValidateOptionsType;
}
