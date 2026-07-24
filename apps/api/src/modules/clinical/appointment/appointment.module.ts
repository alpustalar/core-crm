import { AppointmentQueryModule } from '@modules/clinical/appointment/application/queries/query.module';
import { AppointmentCommandModule } from '@modules/clinical/appointment/application/commands/command.module';
import { Module } from '@nestjs/common';
import { AppointmentPresentationModule } from '@modules/clinical/appointment/presentation/appointment-presentation.module';
import { AppointmentEventListenersModule } from '@modules/clinical/appointment/infrastructure/events/appointment-event-listeners.module';
import { AppointmentAiToolsModule } from '@modules/clinical/appointment/application/ai-tools/appointment-ai-tools.module';

@Module({
  imports: [
    AppointmentQueryModule,
    AppointmentCommandModule,
    AppointmentPresentationModule,
    AppointmentEventListenersModule,
    AppointmentAiToolsModule,
  ],
})
export class AppointmentModule {}
