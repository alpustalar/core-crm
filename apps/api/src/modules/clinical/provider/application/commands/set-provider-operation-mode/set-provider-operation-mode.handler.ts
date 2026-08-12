import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SetProviderOperationModeCommand } from './set-provider-operation-mode.command';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository';

@CommandHandler(SetProviderOperationModeCommand)
export class SetProviderOperationModeHandler
  implements ICommandHandler<SetProviderOperationModeCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: SetProviderOperationModeCommand): Promise<void> {
    const { providerId, data, ctx } = command.payload;

    const provider = await this.providerRepo.findById(providerId);

    if (!provider) throw new ProviderNotFoundException();

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanAccessTargetClinic(provider.clinicId.value)
      )
      .orThrow(PROVIDER_EVENTS.OPERATION_MODE_SET);

    provider.setOperationMode(data.operationMode);
    await this.providerRepo.update(provider);
  }
}
