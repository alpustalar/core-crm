import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterClinicAccountHandler } from '@modules/identity/auth/registration/application/commands/register-clinic-account/register-clinic-account.handler';
import { RegisterOrganizationAccountHandler } from '@modules/identity/auth/registration/application/commands/register-organization-account/register-organization-account.handler';
import { RegisterPatientAccountHandler } from '@modules/identity/auth/registration/application/commands/register-patient-account/register-patient-account.handler';
import { RegisterUserOrProviderAccountHandler } from '@modules/identity/auth/registration/application/commands/register-user-or-provider-account/register-user-or-provider-account.handler';

const Handlers = [
  RegisterClinicAccountHandler,
  RegisterOrganizationAccountHandler,
  RegisterPatientAccountHandler,
  RegisterUserOrProviderAccountHandler,
];

/**
 * Kayıt akışı handler'ları. Orkestrasyon CommandBus/QueryBus üzerinden yürür;
 * FirebaseModule ve PolicyModule @Global olduğu için ek import gerekmez.
 */
@Module({
  imports: [CqrsModule],
  providers: Handlers,
  exports: Handlers,
})
export class RegistrationCommandModule {}
