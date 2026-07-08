import { ActorContext } from '@common/interfaces';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';
import { ValidateOptionsType } from '@common/domain/constants/default-options.constant';

export const ENTITY_POLICY = Symbol('IEntityPolicy');
export interface IEntityPolicy {
  getValidateOptions(
    actor: ActorContext,
    source: ExecutionSource,
    businessRulesEnabled?: boolean
  ): ValidateOptionsType;
}
