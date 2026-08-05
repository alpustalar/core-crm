import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateTreatmentPackageCommand } from './update-treatment-package.command';
import type { UpdateTreatmentPackageResponse } from './update-treatment-package.response';
import {
  ITreatmentPackageCommandRepository,
  TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/clinical/treatment-package/domain/repositories/treatment-package.repository.interface';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { Money } from '@src/domain/value-objects/money.vo';
import { Decimal } from 'decimal.js';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { TREATMENT_PACKAGE_EVENTS } from '@src/domain/constants/events';

@CommandHandler(UpdateTreatmentPackageCommand)
export class UpdateTreatmentPackageHandler implements ICommandHandler<
  UpdateTreatmentPackageCommand,
  UpdateTreatmentPackageResponse
> {
  constructor(
    @Inject(TREATMENT_PACKAGE_COMMAND_REPO)
    private readonly treatmentPackageRepo: ITreatmentPackageCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: UpdateTreatmentPackageCommand
  ): Promise<UpdateTreatmentPackageResponse> {
    const { packageId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const treatmentPackage =
        await this.treatmentPackageRepo.findById(packageId);
      if (!treatmentPackage)
        throw new NotFoundException('Tedavi paketi bulunamadı');

      this.policyFactory
        .clinic(ctx.actor, ctx.source)
        .evaluator.check((p) =>
          p.actorCanAccessTargetClinic(treatmentPackage.clinicId.value)
        )
        .orThrow(TREATMENT_PACKAGE_EVENTS.UPDATED);

      const { price = null, currency = null, ...restDto } = data;
      treatmentPackage.update({
        ...restDto,
        ...(price &&
          currency && {
            price: Money.create(new Decimal(price), currency).orThrow(),
          }),
      });
      await this.treatmentPackageRepo.update(treatmentPackage);
    });
  }
}
