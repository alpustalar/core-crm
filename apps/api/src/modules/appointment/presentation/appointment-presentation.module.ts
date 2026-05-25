import { Module } from '@nestjs/common';

import {
  AppointmentController,
  PatientController,
} from '@modules/appointment/presentation/controllers';
import { AppointmentQueryModule } from '@modules/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/appointment/application/commands/command.module';
import { PatientAuthModule } from '@modules/patient-auth/patient-auth.module';

@Module({
  imports: [
    AppointmentQueryModule,
    AppointmentCommandModule,
    PatientAuthModule,
  ],
  controllers: [AppointmentController, PatientController],
})
export class AppointmentPresentationModule {}
