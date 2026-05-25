import { AppointmentQueryModule } from '@modules/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/appointment/application/commands/command.module';
import { Module } from '@nestjs/common';
import { AppointmentPresentationModule } from '@modules/appointment/presentation/appointment-presentation.module';

@Module({
  imports: [
    AppointmentQueryModule,
    AppointmentCommandModule,
    AppointmentPresentationModule,
  ],
})
export class AppointmentModule {}
