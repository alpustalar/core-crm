import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SetProviderActiveCommand } from './set-provider-active.command';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';

@CommandHandler(SetProviderActiveCommand)
export class SetProviderActiveHandler
  implements ICommandHandler<SetProviderActiveCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerCommandRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: SetProviderActiveCommand): Promise<void> {
    const { providerId, data, ctx } = command.payload;

    const provider = await this.providerCommandRepo.findById(providerId);
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

    await this.providerCommandRepo.save(provider);
  }
}
