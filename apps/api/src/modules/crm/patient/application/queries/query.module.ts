import { Module } from '@nestjs/common';
import { FindPatientByIdHandler } from './find-patient-by-id/find-patient-by-id.handler';
import { FindPatientByContactHandler } from './find-patient-by-contact/find-patient-by-contact.handler';
import { PatientRepositoryModule } from '@modules/crm/patient/infrastructure/persistence/prisma/repositories/patient/patient.repository.module';

const QueryHandlers = [FindPatientByIdHandler, FindPatientByContactHandler];

@Module({
  imports: [PatientRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class PatientQueryModule {}
