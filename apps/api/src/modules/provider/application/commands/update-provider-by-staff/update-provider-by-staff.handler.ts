import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import {
  IProviderRepository,
  PROVIDER_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { ProviderCommandsPrismaMapper } from '@modules/provider/infrastructure/persistence/prisma/mappers/provider-commands-prisma.mapper';
import { UpdateProviderByStaffCommand } from '@modules/provider/application/commands/update-provider-by-staff/update-provider-by-staff.command';

@CommandHandler(UpdateProviderByStaffCommand)
export class UpdateProviderByStaffHandler
  implements ICommandHandler<UpdateProviderByStaffCommand, string>
{
  constructor(
    @Inject(PROVIDER_REPO_TOKEN)
    private readonly providerRepo: IProviderRepository,
    private readonly policyFactory: PolicyFactory
  ) {}

  async execute(command: UpdateProviderByStaffCommand) {
    const { providerId, dto, context } = command;

    const provider = await this.providerRepo.findById(providerId);

    if (!provider) {
      throw new NotFoundException('Provider bulunamadı.');
    }

    const { evaluator } = this.policyFactory.user(context.actor);
    evaluator
      .check((p) => p.isTargetInActorsManagedClinic(provider.clinicId))
      .orThrow();

    const input = ProviderCommandsPrismaMapper.toUpdateInput(dto);

    const providerRaw = await this.providerRepo.update(providerId, input);
    return providerRaw.id;
  }
}
