import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IProviderCommandRepository,
  IProviderQueryRepository,
  PROVIDER_COMMAND_REPOSITORY,
  PROVIDER_QUERY_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/domain/interfaces/policy-factory.interface';
import { UpdateProviderInfoCommand } from './update-provider-info.command';

@CommandHandler(UpdateProviderInfoCommand)
export class UpdateProviderInfoHandler
  implements ICommandHandler<UpdateProviderInfoCommand, void>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerCommandRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: UpdateProviderInfoCommand): Promise<void> {
    const { providerId, dto, ctx } = command;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) throw new NotFoundException('Provider bulunamadı.');

    const { evaluator } = this.policyFactory.user(ctx.actor);
    evaluator
      .check((p) => p.isTargetInActorsManagedClinic(provider.clinicId))
      .orThrow();

    await this.providerCommandRepo.update(providerId, dto);
  }
}
