import { Validate } from '@common/interfaces';

export interface ILeadRules {
  convert(): Validate;
  markLost(): Validate;
  qualify(): Validate;
  contact(): Validate;
}
