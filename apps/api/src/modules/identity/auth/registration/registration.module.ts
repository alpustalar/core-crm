import { Module } from '@nestjs/common';
import { RegistrationPresentationModule } from '@modules/identity/auth/registration/presentation/presentation.module';
import { RegistrationCommandModule } from '@modules/identity/auth/registration/application/commands/command.module';

@Module({
  imports: [RegistrationPresentationModule, RegistrationCommandModule],
})
export class RegistrationModule {}
