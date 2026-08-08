import { Module } from '@nestjs/common';
import { RegistrationPresentationModule } from '@modules/identity/auth/registration/presentation/presentation.module';

@Module({ imports: [RegistrationPresentationModule] })
export class RegistrationModule {}
