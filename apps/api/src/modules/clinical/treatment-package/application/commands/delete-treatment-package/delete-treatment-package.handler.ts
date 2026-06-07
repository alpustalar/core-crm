import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteTreatmentPackageCommand } from './delete-treatment-package.command';
import type { DeleteTreatmentPackageResponse } from './delete-treatment-package.response';
import {
  ITreatmentPackageCommandRepository,
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_COMMAND_REPO,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';

@CommandHandler(DeleteTreatmentPackageCommand)
export class DeleteTreatmentPackageHandler
  implements
    ICommandHandler<
      DeleteTreatmentPackageCommand,
      DeleteTreatmentPackageResponse
    >
{
  constructor(
    @Inject(TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly treatmentPackageCommandRepo: ITreatmentPackageCommandRepository,
    @Inject(TREATMENT_PACKAGE_QUERY_REPO)
    private readonly treatmentPackageQueryRepo: ITreatmentPackageQueryRepository
  ) {}

  async execute(
    command: DeleteTreatmentPackageCommand
  ): Promise<DeleteTreatmentPackageResponse> {
    const { packageId } = command;

    const existing = await this.treatmentPackageQueryRepo.findById(packageId);
    if (!existing) throw new NotFoundException('Tedavi paketi bulunamadı');

    await this.treatmentPackageCommandRepo.softDelete(packageId);

    return { success: true };
  }
}
