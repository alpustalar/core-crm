import { Module } from '@nestjs/common';
import { AppointmentCommandModule } from '@modules/clinical/appointment/application/commands/command.module';
import { AppointmentQueryModule } from '@modules/clinical/appointment/application/queries/query.module';
import { AppointmentAiToolsModule } from '@modules/clinical/appointment/application/ai-tools/appointment-ai-tools.module';

const ApplicationModules = [
  AppointmentCommandModule,
  AppointmentQueryModule,
  AppointmentAiToolsModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class AppointmentApplicationModule {}
