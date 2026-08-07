import { Module } from '@nestjs/common';
import { TreatmentPackageCommandRepository } from './treatment-package.command.repository';
import { TreatmentPackageQueryRepository } from './treatment-package.query.repository';
import { TREATMENT_PACKAGE_COMMAND_REPO } from '@modules/clinical/treatment-package/domain/repositories/treatment-package/treatment-package.command.repository';
import { TREATMENT_PACKAGE_QUERY_REPO } from '@modules/clinical/treatment-package/domain/repositories/treatment-package/treatment-package.query.repository';

@Module({
  providers: [
    {
      provide: TREATMENT_PACKAGE_COMMAND_REPO,
      useClass: TreatmentPackageCommandRepository,
    },
    {
      provide: TREATMENT_PACKAGE_QUERY_REPO,
      useClass: TreatmentPackageQueryRepository,
    },
  ],
  exports: [TREATMENT_PACKAGE_COMMAND_REPO, TREATMENT_PACKAGE_QUERY_REPO],
})
export class TreatmentPackageRepositoryModule {}
