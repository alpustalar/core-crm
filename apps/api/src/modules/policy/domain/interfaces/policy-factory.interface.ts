import { ActorContext } from '@common/interfaces';
import { AppointmentPolicy } from '@modules/appointment/application/policies/appointment.policy';
import { ClinicPolicy } from '@modules/clinic/application/policies';
import { OrganizationPolicy } from '@modules/organization/application/policies/organization.policy';
import { PolicyEvaluator } from '@modules/policy/application/policy-evaluator';
import { UserPolicy } from '@modules/user/application/policies';
export const POLICY_FACTORY = Symbol('IPolicyFactory');
export interface IPolicyFactory {
  user(actor: ActorContext): {
    evaluator: PolicyEvaluator<UserPolicy>;
    policy: UserPolicy;
  };
  organization(actor: ActorContext): {
    evaluator: PolicyEvaluator<OrganizationPolicy>;
    policy: OrganizationPolicy;
  };
  clinic(actor: ActorContext): {
    evaluator: PolicyEvaluator<ClinicPolicy>;
    policy: ClinicPolicy;
  };
  appointment(actor: ActorContext): {
    evaluator: PolicyEvaluator<AppointmentPolicy>;
    policy: AppointmentPolicy;
  };
}


