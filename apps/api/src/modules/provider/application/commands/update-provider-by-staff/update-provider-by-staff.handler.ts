import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IProviderRepository,
  PROVIDER_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { UpdateProviderByStaffCommand } from '@modules/provider/application/commands/update-provider-by-staff/update-provider-by-staff.command';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';

@CommandHandler(UpdateProviderByStaffCommand)
export class UpdateProviderByStaffHandler
  implements ICommandHandler<UpdateProviderByStaffCommand, string>
{
  constructor(
    @Inject(PROVIDER_REPO_TOKEN)
    private readonly providerRepo: IProviderRepository,
    @Inject(POLICY_FACTORY_TOKEN)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: UpdateProviderByStaffCommand) {
    const { providerId, dto, context } = command;

    const provider = await this.providerRepo.find(providerId);

    if (!provider) {
      throw new NotFoundException('Provider bulunamadı.');
    }

    const { evaluator } = this.policyFactory.user(context.actor);
    evaluator
      .check((p) => p.isTargetInActorsManagedClinic(provider.clinicId))
      .orThrow();

    const providerRaw = await this.providerRepo.update(providerId, dto);
    return providerRaw.id;
  }
}
