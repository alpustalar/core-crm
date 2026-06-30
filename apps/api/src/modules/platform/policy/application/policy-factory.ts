import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActorContext } from '@common/interfaces';
import { OrganizationPolicy } from '@modules/organization/organization/application/policies/organization.policy';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { AppointmentPolicy } from '@modules/clinical/appointment/application/policies/appointment.policy';
import { PolicyEvaluator } from '@modules/platform/policy/application/policy-evaluator';
import { BasePolicy } from '@modules/platform/policy/application/base.policy';
import { IPolicyFactory } from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { UserPolicy } from '@modules/identity/user/application/policies/user.policy';
import { ProviderPolicy } from '@modules/clinical/provider/application/policies/provider.policy';

@Injectable()
export class PolicyFactory implements IPolicyFactory {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  user(actor: ActorContext) {
    return this.build(UserPolicy, actor);
  }

  organization(actor: ActorContext) {
    return this.build(OrganizationPolicy, actor);
  }

  clinic(actor: ActorContext) {
    return this.build(ClinicPolicy, actor);
  }

  appointment(actor: ActorContext) {
    return this.build(AppointmentPolicy, actor);
  }

  provider(actor: ActorContext) {
    return this.build(ProviderPolicy, actor);
  }

  private build<T extends BasePolicy>(
    PolicyClass: new (actor: ActorContext) => T,
    actor: ActorContext
  ) {
    const policy = new PolicyClass(actor);
    const evaluator = new PolicyEvaluator(policy, this.eventEmitter);
    return { evaluator, policy };
  }
}
