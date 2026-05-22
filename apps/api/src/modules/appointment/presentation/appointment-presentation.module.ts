import { Module } from '@nestjs/common';

import {
  AppointmentController,
  PatientController,
} from '@modules/appointment/presentation/controllers';
import { AppointmentQueryModule } from '@modules/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/appointment/application/commands/command.module';
import { CqrsModule } from '@nestjs/cqrs';
import { PatientAuthModule } from '@modules/patient-auth/patient-auth.module';

@Module({
  imports: [CqrsModule, AppointmentQueryModule, AppointmentCommandModule, PatientAuthModule],
  controllers: [AppointmentController, PatientController],
})
export class AppointmentPresentationModule {}
