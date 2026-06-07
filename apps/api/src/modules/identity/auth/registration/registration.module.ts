import { Module } from '@nestjs/common';
import { FirebaseModule } from '@modules/identity/auth/firebase/firebase.module';
import { UserModule } from '@modules/identity/user/user.module';
import { ClinicModule } from '@modules/organization/clinic/clinic.module';
import { RoleModule } from '@modules/identity/role/role.module';
import { OrganizationModule } from '@modules/organization/organization/organization.module';
import { RegistrationPresentationModule } from '@modules/identity/auth/registration/presentation/registration-presentation.module';
import { RegistrationCommandModule } from '@modules/identity/auth/registration/application/commands/command.module';

@Module({
  imports: [
    RegistrationCommandModule,
    FirebaseModule,
    UserModule,
    ClinicModule,
    RoleModule,
    OrganizationModule,
    RegistrationPresentationModule,
  ],
})
export class RegistrationModule {}
