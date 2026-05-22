import { PatientQueryModule } from '@modules/patient/application/queries/query.module';
import { Module } from '@nestjs/common';
import { PatientModuleApi } from '@modules/patient/patient.module.api';
import { CqrsModule } from '@nestjs/cqrs';
import { PATIENT_MODULE_API } from '@modules/patient/domain/interfaces/patient.module.api.interface';

@Module({
  imports: [CqrsModule, PatientQueryModule],
  providers: [{ provide: PATIENT_MODULE_API, useClass: PatientModuleApi }],
  exports: [PATIENT_MODULE_API],
})
export class PatientModule {}
