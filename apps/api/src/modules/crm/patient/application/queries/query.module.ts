import { Module } from '@nestjs/common';
import { FindPatientByIdHandler } from './find-patient-by-id/find-patient-by-id.handler';
import { FindPatientByFirebaseUidHandler } from './find-patient-by-firebase-uid/find-patient-by-firebase-uid.handler';
import { FindOrCreatePatientForAuthHandler } from './find-or-create-patient-for-auth/find-or-create-patient-for-auth.handler';
import { FindPatientByContactHandler } from './find-patient-by-contact/find-patient-by-contact.handler';
import { PatientRepositoryModule } from '@modules/crm/patient/infrastructure/persistence/prisma/repositories/patient.repository.module';

const QueryHandlers = [
  FindPatientByIdHandler,
  FindPatientByFirebaseUidHandler,
  FindOrCreatePatientForAuthHandler,
  FindPatientByContactHandler,
];

@Module({
  imports: [PatientRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class PatientQueryModule {}
