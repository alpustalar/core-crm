import { Module } from '@nestjs/common';
import {
  PATIENT_COMMAND_REPOSITORY,
  PATIENT_QUERY_REPOSITORY,
} from '@modules/crm/patient/domain/repositories/patient.repository.interface';
import { PatientCommandRepository } from '@modules/crm/patient/infrastructure/persistence/prisma/repositories/patient.command.repository';
import { PatientQueryRepository } from '@modules/crm/patient/infrastructure/persistence/prisma/repositories/patient.query.repository';

@Module({
  providers: [
    { provide: PATIENT_COMMAND_REPOSITORY, useClass: PatientCommandRepository },
    { provide: PATIENT_QUERY_REPOSITORY, useClass: PatientQueryRepository },
  ],
  exports: [PATIENT_COMMAND_REPOSITORY, PATIENT_QUERY_REPOSITORY],
})
export class PatientRepositoryModule {}
