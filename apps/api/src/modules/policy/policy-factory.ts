import { Injectable } from '@nestjs/common';
import { ActorContext } from '@common/interfaces';
import { OrganizationPolicy } from '@modules/organization/application/policies/organization.policy';
import { UserPolicy } from '@modules/user/application/policies';
import { ClinicPolicy } from '@modules/clinic/application/policies';
import { PolicyEvaluator } from '@modules/policy/policy-evaluator';
import { BasePolicy } from '@modules/policy/base.policy';

@Injectable()
export class PolicyFactory {
  organization(actor: ActorContext) {
    const evaluator = this.create(OrganizationPolicy, actor);
    const policy = new OrganizationPolicy(actor);
    return { evaluator, policy };
  }

  user(actor: ActorContext) {
    const evaluator = this.create(UserPolicy, actor);
    const policy = new UserPolicy(actor);
    return { evaluator, policy };
  }

  clinic(actor: ActorContext) {
    const evaluator = this.create(ClinicPolicy, actor);
    const policy = new ClinicPolicy(actor);
    return { evaluator, policy };
  }

  private create<T extends BasePolicy>(
    PolicyClass: new (actor: ActorContext) => T,
    actor: ActorContext
  ): PolicyEvaluator<T> {
    return new PolicyEvaluator(new PolicyClass(actor));
  }
}
