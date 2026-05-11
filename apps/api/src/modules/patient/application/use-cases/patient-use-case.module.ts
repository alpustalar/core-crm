import { FindPatientByIdUseCase } from '@modules/patient/application/use-cases/queries';
import { Module } from '@nestjs/common';
import { PatientRepository } from '@modules/patient/infrastructure/persistence/prisma/repositories';

const UseCases = [FindPatientByIdUseCase];

@Module({
  providers: [...UseCases, PatientRepository],
  exports: [...UseCases],
})
export class PatientUseCaseModule {}
