import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FindPatientByIdHandler } from './find-patient-by-id/find-patient-by-id.handler';
import { PATIENT_REPO_TOKEN } from '@modules/patient/domain/repositories/patient.repository.interface';
import { PatientRepository } from '@modules/patient/infrastructure/persistence/prisma/repositories';

const QueryHandlers = [FindPatientByIdHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ...QueryHandlers,
    { provide: PATIENT_REPO_TOKEN, useClass: PatientRepository },
  ],
  exports: [...QueryHandlers],
})
export class PatientQueryModule {}
