import { PatientCommandModule } from '@modules/crm/patient/application/commands/command.module';
import { PatientQueryModule } from '@modules/crm/patient/application/queries/query.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PatientCommandModule,PatientQueryModule],
})
export class PatientModule {}
