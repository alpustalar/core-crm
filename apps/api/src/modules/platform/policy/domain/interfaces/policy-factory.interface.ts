import { ActorContext } from '@common/interfaces';
import { AppointmentPolicy } from '@modules/clinical/appointment/application/policies/appointment.policy';
import { ClinicPolicy } from '@modules/organization/clinic/application/policies';
import { OrganizationPolicy } from '@modules/organization/organization/application/policies/organization.policy';
import { PolicyEvaluator } from '@modules/platform/policy/application/policy-evaluator';
import { UserPolicy } from '@modules/identity/user/application/policies/user.policy';
import { ProviderPolicy } from '@modules/clinical/provider/application/policies/provider.policy';

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
  provider(actor: ActorContext): {
    evaluator: PolicyEvaluator<ProviderPolicy>;
    policy: ProviderPolicy;
  };
}
