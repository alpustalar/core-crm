import { Module } from '@nestjs/common';
import { FindTreatmentPackagesHandler } from './find-treatment-packages/find-treatment-packages.handler';
import { FindPatientPackagesHandler } from './find-patient-packages/find-patient-packages.handler';
import { TreatmentPackageRepositoryModule } from '@modules/treatment-package/infrastructure/persistence/prisma/repositories/treatment-package/treatment-package.repository.module';
import { PatientTreatmentPackageRepositoryModule } from '@modules/treatment-package/infrastructure/persistence/prisma/repositories/patient-treatment-package/patient-treatment-package.repository.module';

export const TREATMENT_PACKAGE_QUERY_HANDLERS = [
  FindTreatmentPackagesHandler,
  FindPatientPackagesHandler,
];

@Module({
  imports: [
    TreatmentPackageRepositoryModule,
    PatientTreatmentPackageRepositoryModule,
  ],
  providers: TREATMENT_PACKAGE_QUERY_HANDLERS,
  exports: TREATMENT_PACKAGE_QUERY_HANDLERS,
})
export class TreatmentPackageQueryModule {}
