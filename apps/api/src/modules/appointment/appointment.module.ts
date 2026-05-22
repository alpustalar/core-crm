import { AppointmentQueryModule } from '@modules/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/appointment/application/commands/command.module';
import { Module } from '@nestjs/common';
import { AppointmentPresentationModule } from '@modules/appointment/presentation/appointment-presentation.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    AppointmentQueryModule,
    AppointmentCommandModule,
    AppointmentPresentationModule,
  ],
})
export class AppointmentModule {}
