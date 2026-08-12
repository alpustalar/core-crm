import { Module } from '@nestjs/common';
import { PatientAuthModule } from '@modules/identity/auth/patient-auth/patient-auth.module';
import { AppointmentQueryController } from '@modules/clinical/appointment/presentation/http/controllers/appointment/appointment.query.controller';
import { AppointmentCommandController } from '@modules/clinical/appointment/presentation/http/controllers/appointment/appointment.command.controller';
import { PatientCommandController } from '@modules/clinical/appointment/presentation/http/controllers/patient/patient.command.controller';

@Module({
  imports: [PatientAuthModule],
  controllers: [
    AppointmentQueryController,
    AppointmentCommandController,
    PatientCommandController,
  ],
})
export class AppointmentPresentationModule {}
