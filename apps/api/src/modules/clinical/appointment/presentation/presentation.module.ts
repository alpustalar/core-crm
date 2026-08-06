import { Module } from '@nestjs/common';
import { PatientAuthModule } from '@modules/identity/auth/patient-auth/patient-auth.module';
import { AppointmentQueryController } from '@modules/clinical/appointment/presentation/controllers/appointment/appointment-query.controller';
import { AppointmentCommandController } from '@modules/clinical/appointment/presentation/controllers/appointment/appointment-command.controller';
import { PatientCommandController } from '@modules/clinical/appointment/presentation/controllers/patient/patient-command.controller';
import { AppointmentApplicationModule } from '@modules/clinical/appointment/application/application.module';

@Module({
  imports: [AppointmentApplicationModule, PatientAuthModule],
  controllers: [
    AppointmentQueryController,
    AppointmentCommandController,
    PatientCommandController,
  ],
})
export class AppointmentPresentationModule {}
