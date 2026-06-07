import { AppointmentQueryModule } from '@modules/clinical/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/clinical/appointment/application/commands/command.module';
import { Module } from '@nestjs/common';
import { AppointmentPresentationModule } from '@modules/clinical/appointment/presentation/appointment-presentation.module';

@Module({
  imports: [
    AppointmentQueryModule,
    AppointmentCommandModule,
    AppointmentPresentationModule,
  ],
})
export class AppointmentModule {}
