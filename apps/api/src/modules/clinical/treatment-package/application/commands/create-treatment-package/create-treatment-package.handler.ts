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
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

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
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: CreateTreatmentPackageCommand
  ): Promise<CreateTreatmentPackageResponse> {
    const { data, ctx } = command;

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) => p.actorCanAccessTargetClinic(data.clinicId))
      .orThrow();

    const treatmentPackage = TreatmentPackage.create({
      clinicId: data.clinicId,
      name: data.name,
      examinationCount: data.examinationCount,
      controlCount: data.controlCount,
      validityDays: data.validityDays,
      price: Money.create(data.price, data.currency).orThrow(),
      providerIds: data.providerIds,
      items: data.items,
    });

    return this.txManager.run(async () => {
      await this.treatmentPackageCommandRepo.create(treatmentPackage);
      return treatmentPackage.id.value;
    });
  }
}
