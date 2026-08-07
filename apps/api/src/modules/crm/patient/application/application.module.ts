import { Module } from '@nestjs/common';
import { PatientQueryModule } from '@modules/crm/patient/application/queries/query.module';
import { PatientCommandModule } from '@modules/crm/patient/application/commands/command.module';

const ApplicationModules = [PatientCommandModule, PatientQueryModule];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class PatientApplicationModule {}
