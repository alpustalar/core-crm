import { PatientQueryModule } from '@modules/patient/application/queries/query.module';
import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';

import { PatientModuleApi } from '@modules/patient/patient.module.api';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [PatientQueryModule, PrismaModule, CqrsModule],
  providers: [PatientModuleApi],
  exports: [PatientModuleApi],
})
export class PatientModule {}
