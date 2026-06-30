import { Module } from '@nestjs/common';
import { RegisterClinicAccountHandler } from '@modules/identity/auth/registration/application/commands/register-clinic-account/register-clinic-account.handler';
import { RegisterOrganizationAccountHandler } from '@modules/identity/auth/registration/application/commands/register-organization-account/register-organization-account.handler';
import { RegisterPatientAccountHandler } from '@modules/identity/auth/registration/application/commands/register-patient-account/register-patient-account.handler';

const Handlers = [
  RegisterClinicAccountHandler,
  RegisterOrganizationAccountHandler,
  RegisterPatientAccountHandler,
];

@Module({
  providers: Handlers,
  exports: Handlers,
})
export class RegistrationCommandModule {}
