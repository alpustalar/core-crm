import {
  DefaultValidateOptions,
  ValidateOptionsType,
} from '@common/domain/constants/default-options.constant';

export const shouldValidate = (
  options: ValidateOptionsType = DefaultValidateOptions
) => {
  const mergedOptions = { ...DefaultValidateOptions, ...options };

  return mergedOptions.businessRulesEnabled && !mergedOptions.systemOverride;
};
