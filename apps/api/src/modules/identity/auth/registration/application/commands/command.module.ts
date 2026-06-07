import { Module } from '@nestjs/common';
import { RegisterClinicAccountHandler } from '@modules/identity/auth/registration/application/commands/register-clinic-account/register-clinic-account.handler';

@Module({
  providers: [RegisterClinicAccountHandler],
})
export class RegistrationCommandModule {}
