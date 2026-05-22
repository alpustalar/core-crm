import { RegisterOrganizationAccountHandler } from './register-organization-account/register-organization-account.handler';
import { Module } from '@nestjs/common';
import { RegisterClinicAccountHandler } from '@modules/registration/application/commands/register-clinic-account/register-clinic-account.handler';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule],
  providers: [RegisterClinicAccountHandler],
})
export class RegistrationCommandModule {}
