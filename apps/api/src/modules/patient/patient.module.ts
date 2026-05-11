import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { PatientUseCaseModule } from '@modules/patient/application/use-cases/patient-use-case.module';
import { PatientModuleApi } from '@modules/patient/patient-module.api';

@Module({
  imports: [PrismaModule, PatientUseCaseModule],
  providers: [PatientModuleApi],
  exports: [PatientModuleApi],
})
export class PatientModule {}
