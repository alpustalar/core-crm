import { Module } from '@nestjs/common';
import { PatientRepositoryModule } from '@modules/crm/patient/infrastructure/persistence/prisma/repositories/patient/patient.repository.module';

const RepositoriesModules = [PatientRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class PatientRepositoriesModule {}
