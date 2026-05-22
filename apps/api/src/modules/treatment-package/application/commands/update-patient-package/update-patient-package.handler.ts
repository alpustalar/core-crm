import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdatePatientPackageCommand } from './update-patient-package.command';
import type { UpdatePatientPackageResponse } from './update-patient-package.response';
import {
  IPatientTreatmentPackageCommandRepository,
  IPatientTreatmentPackageQueryRepository,
  PATIENT_TREATMENT_PACKAGE_COMMAND_REPO,
  PATIENT_TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/treatment-package/domain/repositories/patient-treatment-package.repository.interface';

@CommandHandler(UpdatePatientPackageCommand)
export class UpdatePatientPackageHandler
  implements
    ICommandHandler<UpdatePatientPackageCommand, UpdatePatientPackageResponse>
{
  constructor(
    @Inject(PATIENT_TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly patientPackageCommandRepo: IPatientTreatmentPackageCommandRepository,
    @Inject(PATIENT_TREATMENT_PACKAGE_QUERY_REPO)
    private readonly patientPackageQueryRepo: IPatientTreatmentPackageQueryRepository
  ) {}

  async execute(
    command: UpdatePatientPackageCommand
  ): Promise<UpdatePatientPackageResponse> {
    const { patientPackageId, dto } = command;

    const existing =
      await this.patientPackageQueryRepo.findById(patientPackageId);
    if (!existing) throw new NotFoundException('Hasta paketi bulunamadı');

    const updated = await this.patientPackageCommandRepo.update(
      patientPackageId,
      dto
    );

    return { id: updated.id };
  }
}
