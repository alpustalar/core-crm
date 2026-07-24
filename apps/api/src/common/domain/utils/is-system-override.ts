import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

export const isSystemOverride = (options: ValidateOptionsType) => {
  return options.systemOverride;
};
