import { Module } from '@nestjs/common';
import { PatientTreatmentPackageRepositoryModule } from '@modules/clinical/treatment-package/infrastructure/persistence/prisma/repositories/patient-treatment-package/patient-treatment-package.repository.module';
import { TreatmentPackageRepositoryModule } from '@modules/clinical/treatment-package/infrastructure/persistence/prisma/repositories/treatment-package/treatment-package.repository.module';

@Module({
  imports: [
    PatientTreatmentPackageRepositoryModule,
    TreatmentPackageRepositoryModule,
  ],
  exports: [
    PatientTreatmentPackageRepositoryModule,
    TreatmentPackageRepositoryModule,
  ],
})
export class TreatmentPackageRepositoriesModule {}
