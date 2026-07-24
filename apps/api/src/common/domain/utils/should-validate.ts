import { DefaultValidateOptions } from '@common/domain/constants/default-options.constant';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

export const shouldValidate = (
  options: ValidateOptionsType = DefaultValidateOptions
) => {
  const mergedOptions = { ...DefaultValidateOptions, ...options };

  return mergedOptions.businessRulesEnabled && !mergedOptions.systemOverride;
};
