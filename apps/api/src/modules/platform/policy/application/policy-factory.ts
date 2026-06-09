import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActorContext } from '@common/interfaces';
import { OrganizationPolicy } from '@modules/organization/organization/application/policies/organization.policy';
import { UserPolicy } from '@modules/identity/user/application/policies';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { AppointmentPolicy } from '@modules/clinical/appointment/application/policies/appointment.policy';
import { PolicyEvaluator } from '@modules/platform/policy/application/policy-evaluator';
import { BasePolicy } from '@modules/platform/policy/application/base.policy';
import { IPolicyFactory } from '@modules/platform/policy/domain/interfaces/policy-factory.interface';

@Injectable()
export class PolicyFactory implements IPolicyFactory {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  user(actor: ActorContext) {
    const policy = new UserPolicy(actor);
    return { evaluator: this.create(UserPolicy, actor), policy };
  }

  organization(actor: ActorContext) {
    const policy = new OrganizationPolicy(actor);
    return { evaluator: this.create(OrganizationPolicy, actor), policy };
  }

  clinic(actor: ActorContext) {
    const policy = new ClinicPolicy(actor);
    return { evaluator: this.create(ClinicPolicy, actor), policy };
  }

  appointment(actor: ActorContext) {
    const policy = new AppointmentPolicy(actor);
    return { evaluator: this.create(AppointmentPolicy, actor), policy };
  }

  private create<T extends BasePolicy>(
    PolicyClass: new (actor: ActorContext) => T,
    actor: ActorContext
  ): PolicyEvaluator<T> {
    return new PolicyEvaluator(new PolicyClass(actor), this.eventEmitter);
  }
}
