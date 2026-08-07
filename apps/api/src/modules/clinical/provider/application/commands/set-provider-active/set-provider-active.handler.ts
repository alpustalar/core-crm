import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SetProviderActiveCommand } from './set-provider-active.command';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository';

@CommandHandler(SetProviderActiveCommand)
export class SetProviderActiveHandler
  implements ICommandHandler<SetProviderActiveCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: SetProviderActiveCommand): Promise<void> {
    const { providerId, data, ctx } = command.payload;

    const provider = await this.providerRepo.findById(providerId);

    if (!provider) throw new ProviderNotFoundException();

    this.policyFactory
      .user(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.isTargetInActorsManagedClinic(provider.clinicId.value)
      )
      .orThrow(PROVIDER_EVENTS.ACTIVATED);

    if (data.isActive) {
      provider.activate();
    } else {
      provider.deactivate();
    }

    await this.providerRepo.update(provider);
  }
}
