import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateTreatmentPackageCommand } from './update-treatment-package.command';
import type { UpdateTreatmentPackageResponse } from './update-treatment-package.response';
import {
  ITreatmentPackageCommandRepository,
  ITreatmentPackageQueryRepository,
  TREATMENT_PACKAGE_COMMAND_REPO,
  TREATMENT_PACKAGE_QUERY_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Money } from '@src/domain/value-objects/money.vo';
import { Decimal } from 'decimal.js';

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
    private readonly treatmentPackageQueryRepo: ITreatmentPackageQueryRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: UpdateTreatmentPackageCommand
  ): Promise<UpdateTreatmentPackageResponse> {
    const { packageId, dto } = command;

    await this.txManager.run(async () => {
      const treatmentPackage =
        await this.treatmentPackageQueryRepo.findById(packageId);
      if (!treatmentPackage)
        throw new NotFoundException('Tedavi paketi bulunamadı');

      const { price = null, currency = null, ...restDto } = dto;
      treatmentPackage.update({
        ...restDto,
        ...(price &&
          currency && {
            price: Money.create(new Decimal(price), currency),
          }),
      });
      await this.treatmentPackageCommandRepo.save(treatmentPackage);
    });
  }
}
