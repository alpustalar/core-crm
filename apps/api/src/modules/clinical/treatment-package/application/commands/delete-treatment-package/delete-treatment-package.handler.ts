import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteTreatmentPackageCommand } from './delete-treatment-package.command';
import type { DeleteTreatmentPackageResponse } from './delete-treatment-package.response';
import {
  ITreatmentPackageCommandRepository,
  TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { TreatmentPackageNotFoundException } from '@modules/clinical/treatment-package/domain/exceptions/treatment-package.exceptions';

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
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: DeleteTreatmentPackageCommand
  ): Promise<DeleteTreatmentPackageResponse> {
    const { packageId } = command;

    const treatmentPackage =
      await this.treatmentPackageCommandRepo.findById(packageId);
    if (!treatmentPackage)
      throw new TreatmentPackageNotFoundException(packageId);

    await this.txManager.run(async () => {
      treatmentPackage.softDelete();
      await this.treatmentPackageCommandRepo.save(treatmentPackage);
    });
  }
}
