import { Module } from '@nestjs/common';
import { PatientTreatmentPackageCommandRepository } from './patient-treatment-package.command.repository';
import { PatientTreatmentPackageQueryRepository } from './patient-treatment-package.query.repository';
import { PATIENT_TREATMENT_PACKAGE_COMMAND_REPO } from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package/patient-treatment-package.command.repository';
import { PATIENT_TREATMENT_PACKAGE_QUERY_REPO } from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package/patient-treatment-package.query.repository';

@Module({
  providers: [
    {
      provide: PATIENT_TREATMENT_PACKAGE_COMMAND_REPO,
      useClass: PatientTreatmentPackageCommandRepository,
    },
    {
      provide: PATIENT_TREATMENT_PACKAGE_QUERY_REPO,
      useClass: PatientTreatmentPackageQueryRepository,
    },
  ],
  exports: [
    PATIENT_TREATMENT_PACKAGE_COMMAND_REPO,
    PATIENT_TREATMENT_PACKAGE_QUERY_REPO,
  ],
})
export class PatientTreatmentPackageRepositoryModule {}
