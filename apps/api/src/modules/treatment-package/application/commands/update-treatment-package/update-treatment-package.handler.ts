import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateTreatmentPackageCommand } from './update-treatment-package.command';
import type { UpdateTreatmentPackageResponse } from './update-treatment-package.response';
import {
  ITreatmentPackageCommandRepository,
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_COMMAND_REPO,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/treatment-package/domain/repositories/treatment-package.repository.interface';

@CommandHandler(UpdateTreatmentPackageCommand)
export class UpdateTreatmentPackageHandler
  implements
    ICommandHandler<
      UpdateTreatmentPackageCommand,
      UpdateTreatmentPackageResponse
    >
{
  constructor(
    @Inject(TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly treatmentPackageCommandRepo: ITreatmentPackageCommandRepository,
    @Inject(TREATMENT_PACKAGE_QUERY_REPO)
    private readonly treatmentPackageQueryRepo: ITreatmentPackageQueryRepository
  ) {}

  async execute(
    command: UpdateTreatmentPackageCommand
  ): Promise<UpdateTreatmentPackageResponse> {
    const { packageId, dto } = command;

    const existing = await this.treatmentPackageQueryRepo.findById(packageId);
    if (!existing) throw new NotFoundException('Tedavi paketi bulunamadı');

    const pkg = await this.treatmentPackageCommandRepo.update(packageId, dto);

    return { id: pkg.id };
  }
}
