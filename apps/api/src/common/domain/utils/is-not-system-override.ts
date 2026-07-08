import { ValidateOptionsType } from '@common/domain/constants/default-options.constant';

export const isNotSystemOverride = (options: ValidateOptionsType) => {
  return !options.systemOverride;
};
