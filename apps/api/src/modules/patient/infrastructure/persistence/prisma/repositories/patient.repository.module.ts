import { Module } from '@nestjs/common';
import { PATIENT_REPOSITORY } from '@modules/patient/domain/repositories/patient.repository.interface';
import { PatientRepository } from './patient.repository';

@Module({
  providers: [{ provide: PATIENT_REPOSITORY, useClass: PatientRepository }],
  exports: [PATIENT_REPOSITORY],
})
export class PatientRepositoryModule {}
