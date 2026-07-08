import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePatientPackageCommand } from './update-patient-package.command';
import type { UpdatePatientPackageResponse } from './update-patient-package.response';
import {
  IPatientTreatmentPackageCommandRepository,
  PATIENT_TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/patient-treatment-package.repository.interface';
import { PatientTreatmentPackageNotFoundException } from '@modules/clinical/treatment-package/domain/exceptions/patient-treatment-package.exceptions';

@CommandHandler(UpdatePatientPackageCommand)
export class UpdatePatientPackageHandler
  implements
    ICommandHandler<UpdatePatientPackageCommand, UpdatePatientPackageResponse>
{
  constructor(
    @Inject(PATIENT_TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly patientTreatmentPackageCommandRepo: IPatientTreatmentPackageCommandRepository
  ) {}

  async execute(
    command: UpdatePatientPackageCommand
  ): Promise<UpdatePatientPackageResponse> {
    const { patientPackageId, dto } = command;

    const patientTreatmentPackage =
      await this.patientTreatmentPackageCommandRepo.findById(patientPackageId);

    if (!patientTreatmentPackage)
      throw new PatientTreatmentPackageNotFoundException();

    patientTreatmentPackage.update(dto);

    await this.patientTreatmentPackageCommandRepo.save(patientTreatmentPackage);

    return patientTreatmentPackage.id.value;
  }
}
