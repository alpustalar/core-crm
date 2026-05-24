import { PatientQueryModule } from '@modules/patient/application/queries/query.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [CqrsModule, PatientQueryModule],
})
export class PatientModule {}
