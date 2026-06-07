import { PatientQueryModule } from '@modules/crm/patient/application/queries/query.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PatientQueryModule],
})
export class PatientModule {}
