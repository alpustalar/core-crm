import { Module } from '@nestjs/common';
import { TreatmentPackageApplicationModule } from '@modules/clinical/treatment-package/application/application.module';
import { TreatmentPackageInfrastructureModule } from '@modules/clinical/treatment-package/infrastructure/infrastructure.module';

@Module({
  imports: [
    TreatmentPackageApplicationModule,
    TreatmentPackageInfrastructureModule,
  ],
})
export class TreatmentPackageModule {}
