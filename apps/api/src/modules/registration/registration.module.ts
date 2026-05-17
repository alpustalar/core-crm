import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { UserModule } from '@modules/user/user.module';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { RoleModule } from '@modules/role/role.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { RegisterClinicAccountHandler } from '@modules/registration/application/commands/register-clinic-account/register-clinic-account.handler';
import { RegistrationController } from '@modules/registration/presentation/registration.controller';

@Module({
  imports: [
    CqrsModule,
    FirebaseModule,
    UserModule,
    ClinicModule,
    RoleModule,
    OrganizationModule,
  ],
  providers: [RegisterClinicAccountHandler],
  controllers: [RegistrationController],
})
export class RegistrationModule {}
