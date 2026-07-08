import { Global, Module } from '@nestjs/common';
import { PolicyFactory } from '@modules/platform/policy/staff/application/policy-factory';
import { POLICY_FACTORY } from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { PolicyEventModule } from '@modules/platform/policy/staff/infrastructure/events/policy-event.module';
import { PATIENT_POLICY_FACTORY } from '@modules/platform/policy/patient/domain/interfaces/patient-policy-factory.interface';
import { PatientPolicyFactory } from '@modules/platform/policy/patient/application/patient-policy-factory';
import { PatientPolicyEventModule } from '@modules/platform/policy/patient/infrastructure/events/patient-policy-event.module';
import { ENTITY_POLICY } from '@modules/platform/policy/entity/domain/interfaces/entity-policy.interface';
import { EntityPolicy } from '@modules/platform/policy/entity/application/entity.policy';

@Global()
@Module({
  imports: [PolicyEventModule, PatientPolicyEventModule],
  providers: [
    {
      provide: POLICY_FACTORY,
      useClass: PolicyFactory,
    },
    {
      provide: PATIENT_POLICY_FACTORY,
      useClass: PatientPolicyFactory,
    },
    {
      provide: ENTITY_POLICY,
      useClass: EntityPolicy,
    },
  ],
  exports: [POLICY_FACTORY, PATIENT_POLICY_FACTORY, ENTITY_POLICY],
})
export class PolicyModule {}
