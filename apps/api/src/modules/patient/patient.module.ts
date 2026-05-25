import { PatientQueryModule } from '@modules/patient/application/queries/query.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [PatientQueryModule],
})
export class PatientModule {}
