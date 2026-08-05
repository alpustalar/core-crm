import { Module } from '@nestjs/common';

import { AppointmentQueryModule } from '@modules/clinical/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/clinical/appointment/application/commands/command.module';
import { PatientAuthModule } from '@modules/identity/auth/patient-auth/patient-auth.module';
import { AppointmentQueryController } from '@modules/clinical/appointment/presentation/controllers/appointment/appointment-query.controller';
import { AppointmentCommandController } from '@modules/clinical/appointment/presentation/controllers/appointment/appointment-command.controller';
import { PatientCommandController } from '@modules/clinical/appointment/presentation/controllers/patient/patient-command.controller';

@Module({
  imports: [
    AppointmentQueryModule,
    AppointmentCommandModule,
    PatientAuthModule,
  ],
  controllers: [
    AppointmentQueryController,
    AppointmentCommandController,
    PatientCommandController,
  ],
})
export class AppointmentPresentationModule {}
