import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { Inject } from '@nestjs/common';
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
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SetProviderOperationModeCommand } from './set-provider-operation-mode.command';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';

@CommandHandler(SetProviderOperationModeCommand)
export class SetProviderOperationModeHandler
  implements ICommandHandler<SetProviderOperationModeCommand, void>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerCommandRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(command: SetProviderOperationModeCommand): Promise<void> {
    const { providerId, dto, ctx } = command;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundException();

    const { evaluator } = this.policyFactory.user(ctx.actor);
    evaluator
      .check((p) => p.isTargetInActorsManagedClinic(provider.clinicId.value))
      .orThrow(PROVIDER_EVENTS.OPERATION_MODE_SET);

    provider.setOperationMode(dto.operationMode);
    await this.providerCommandRepo.save(provider);
  }
}
