import { Module } from '@nestjs/common';

import {
  AppointmentController,
  PatientController,
} from '@modules/clinical/appointment/presentation/controllers';
import { AppointmentQueryModule } from '@modules/clinical/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/clinical/appointment/application/commands/command.module';
import { PatientAuthModule } from '@modules/identity/auth/patient-auth/patient-auth.module';

@Module({
  imports: [
    AppointmentQueryModule,
    AppointmentCommandModule,
    PatientAuthModule,
  ],
  controllers: [AppointmentController, PatientController],
})
export class AppointmentPresentationModule {}
