import { Module } from '@nestjs/common';

import { PatientRepositoryModule } from '@modules/crm/patient/infrastructure/persistence/prisma/repositories/patient/patient.repository.module';
import { CreatePatientHandler } from '@modules/crm/patient/application/commands/create-patient/create-patient.handler';

const Handlers = [CreatePatientHandler];

@Module({
  imports: [PatientRepositoryModule],
  providers: Handlers,
  exports: Handlers,
})
export class PatientCommandModule {}
