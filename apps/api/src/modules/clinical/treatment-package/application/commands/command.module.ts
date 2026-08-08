import { Module } from '@nestjs/common';
import { CreateTreatmentPackageHandler } from './create-treatment-package/create-treatment-package.handler';
import { UpdateTreatmentPackageHandler } from './update-treatment-package/update-treatment-package.handler';
import { DeleteTreatmentPackageHandler } from './delete-treatment-package/delete-treatment-package.handler';
import { AssignPackageToPatientHandler } from './assign-package-to-patient/assign-package-to-patient.handler';
import { UpdatePatientPackageHandler } from './update-patient-package/update-patient-package.handler';
import { TreatmentPackageInfrastructureModule } from '@modules/clinical/treatment-package/infrastructure/infrastructure.module';

export const TREATMENT_PACKAGE_COMMAND_HANDLERS = [
  CreateTreatmentPackageHandler,
  UpdateTreatmentPackageHandler,
  DeleteTreatmentPackageHandler,
  AssignPackageToPatientHandler,
  UpdatePatientPackageHandler,
];

@Module({
  imports: [TreatmentPackageInfrastructureModule],
  providers: TREATMENT_PACKAGE_COMMAND_HANDLERS,
  exports: TREATMENT_PACKAGE_COMMAND_HANDLERS,
})
export class TreatmentPackageCommandModule {}
