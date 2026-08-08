import { Module } from '@nestjs/common';
import { FindTreatmentPackagesHandler } from './find-treatment-packages/find-treatment-packages.handler';
import { FindPatientPackagesHandler } from './find-patient-packages/find-patient-packages.handler';
import { TreatmentPackageRepositoriesModule } from '@modules/clinical/treatment-package/infrastructure/persistence/prisma/repositories/repositories.module';

export const TREATMENT_PACKAGE_QUERY_HANDLERS = [
  FindTreatmentPackagesHandler,
  FindPatientPackagesHandler,
];

@Module({
  imports: [TreatmentPackageRepositoriesModule],
  providers: TREATMENT_PACKAGE_QUERY_HANDLERS,
  exports: TREATMENT_PACKAGE_QUERY_HANDLERS,
})
export class TreatmentPackageQueryModule {}
