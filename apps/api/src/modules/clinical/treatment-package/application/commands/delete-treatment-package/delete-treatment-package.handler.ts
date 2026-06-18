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
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

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
    private readonly treatmentPackageQueryRepo: ITreatmentPackageQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: DeleteTreatmentPackageCommand
  ): Promise<DeleteTreatmentPackageResponse> {
    const { packageId } = command;

    const treatmentPackage =
      await this.treatmentPackageQueryRepo.findById(packageId);
    if (!treatmentPackage)
      throw new NotFoundException('Tedavi paketi bulunamadı');

    await this.txManager.run(async () => {
      treatmentPackage.softDelete();
      await this.treatmentPackageCommandRepo.save(treatmentPackage);
    });
  }
}
