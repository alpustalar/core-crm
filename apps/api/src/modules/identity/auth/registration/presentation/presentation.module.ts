import { Module } from '@nestjs/common';
import { RegistrationController } from '@modules/identity/auth/registration/presentation/http/controllers/registration.controller';

@Module({ controllers: [RegistrationController] })
export class RegistrationPresentationModule {}
