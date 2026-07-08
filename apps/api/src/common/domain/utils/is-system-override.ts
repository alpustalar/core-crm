import { ValidateOptionsType } from '@common/domain/constants/default-options.constant';

export const isSystemOverride = (options: ValidateOptionsType) => {
  return options.systemOverride;
};
