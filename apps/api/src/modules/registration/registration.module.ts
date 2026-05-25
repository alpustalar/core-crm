import { Module } from '@nestjs/common';
import { FirebaseModule } from '@modules/firebase/firebase.module';
import { UserModule } from '@modules/user/user.module';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { RoleModule } from '@modules/role/role.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { RegistrationPresentationModule } from '@modules/registration/presentation/registration-presentation.module';
import { RegistrationCommandModule } from '@modules/registration/application/commands/command.module';

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
