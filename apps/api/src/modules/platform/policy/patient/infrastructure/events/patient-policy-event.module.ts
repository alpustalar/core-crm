import { PatientPolicyAccessDeniedListener } from './listeners/policy-access-denied.listener';
import { Module } from '@nestjs/common';

@Module({
  providers: [PatientPolicyAccessDeniedListener],
})
export class PatientPolicyEventModule {}
