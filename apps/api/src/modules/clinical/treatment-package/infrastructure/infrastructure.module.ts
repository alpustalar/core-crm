import { Module } from '@nestjs/common';
import { TreatmentPackageRepositoriesModule } from '@modules/clinical/treatment-package/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [TreatmentPackageRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class TreatmentPackageInfrastructureModule {}
