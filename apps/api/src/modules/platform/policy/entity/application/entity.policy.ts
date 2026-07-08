import { Inject, Injectable } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { ExecutionSource } from '@src/domain/constants/execution-source.constant';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { ValidateOptionsType } from '@common/domain/constants/default-options.constant';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@Injectable()
export class EntityPolicy {
  constructor(
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  public getValidateOptions(
    actor: ActorContext,
    source: ExecutionSource,
    businessRulesEnabled = true
  ): ValidateOptionsType {
    const isSystemAdmin = this.policyFactory.user(actor).policy.isSystemAdmin();
    const isSystemInitiated = ExecutionPolicy.isSystemInitiated(source);

    return {
      systemOverride: isSystemAdmin || isSystemInitiated,
      businessRulesEnabled,
    };
  }
}
