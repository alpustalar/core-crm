import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTreatmentPackageCommand } from './create-treatment-package.command';
import type { CreateTreatmentPackageResponse } from './create-treatment-package.response';
import {
  ITreatmentPackageCommandRepository,
  TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import { TreatmentPackage } from '@modules/clinical/treatment-package/domain/entities/treatment-package.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Money } from '@src/domain/value-objects/money.vo';
import { ClinicNotAssignedException } from '@src/domain/exceptions/clinic-not-assigned.exception';

@CommandHandler(CreateTreatmentPackageCommand)
export class CreateTreatmentPackageHandler
  implements
    ICommandHandler<
      CreateTreatmentPackageCommand,
      CreateTreatmentPackageResponse
    >
{
  constructor(
    @Inject(TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly treatmentPackageCommandRepo: ITreatmentPackageCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: CreateTreatmentPackageCommand
  ): Promise<CreateTreatmentPackageResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    if (!actor.clinicId) throw new ClinicNotAssignedException();

    const pkg = TreatmentPackage.create({
      clinicId: actor.clinicId,
      name: dto.name,
      examinationCount: dto.examinationCount,
      controlCount: dto.controlCount,
      validityDays: dto.validityDays,
      price: Money.create(dto.price, dto.currency).orThrow(),
      providerIds: dto.providerIds,
      items: dto.items,
    });
    return this.txManager.run(async () => {
      const createdPackage = await this.treatmentPackageCommandRepo.save(pkg);
      return createdPackage.id.value;
    });
  }
}
