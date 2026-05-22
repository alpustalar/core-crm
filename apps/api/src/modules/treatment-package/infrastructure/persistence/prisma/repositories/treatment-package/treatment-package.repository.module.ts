import { Module } from '@nestjs/common';
import {
  TREATMENT_PACKAGE_COMMAND_REPO,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '../../../../../domain/repositories/treatment-package.repository.interface';
import { TreatmentPackageCommandRepository } from './treatment-package.command.repository';
import { TreatmentPackageQueryRepository } from './treatment-package.query.repository';

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
