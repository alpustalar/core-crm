import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { CreateTreatmentPackageCommand } from './create-treatment-package.command';
import type { CreateTreatmentPackageResponse } from './create-treatment-package.response';
import {
  ITreatmentPackageCommandRepository,
  TREATMENT_PACKAGE_COMMAND_REPO,
} from '@modules/treatment-package/domain/repositories/treatment-package.repository.interface';

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
    private readonly treatmentPackageCommandRepo: ITreatmentPackageCommandRepository
  ) {}

  async execute(
    command: CreateTreatmentPackageCommand
  ): Promise<CreateTreatmentPackageResponse> {
    const { dto, ctx } = command;
    const { actor } = ctx;

    if (!actor.clinicId)
      throw new BadRequestException('Actor için klinik tanımlanmamış.');

    const pkg = await this.treatmentPackageCommandRepo.create({
      clinicId: actor.clinicId,
      name: dto.name,
      examinationCount: dto.examinationCount,
      controlCount: dto.controlCount,
      validityDays: dto.validityDays,
      price: dto.price,
      providerIds: dto.providerIds,
      items: dto.items,
    });

    return pkg.id;
  }
}
