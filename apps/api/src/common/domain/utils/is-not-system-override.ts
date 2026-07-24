import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

export const isNotSystemOverride = (options: ValidateOptionsType) => {
  return !options.systemOverride;
};
