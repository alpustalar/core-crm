import { Module } from '@nestjs/common';
import { PatientRepositoriesModule } from '@modules/crm/patient/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [PatientRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],

  exports: [...InfrastructureModules],
})
export class PatientInfrastructureModule {}
