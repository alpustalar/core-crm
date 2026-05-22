import { Module } from '@nestjs/common';
import { RegistrationController } from './controllers/registration.controller';

@Module({
  controllers: [RegistrationController],
})
export class RegistrationPresentationModule {}
