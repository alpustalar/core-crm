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
import { UpdateProviderInfoCommand } from './update-provider-info.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';

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
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateProviderInfoCommand): Promise<void> {
    const { providerId, dto, ctx } = command;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundException();

    this.policyFactory
      .user(ctx.actor)
      .evaluator.bypassIf(ExecutionPolicy.isSystemInitiated(ctx.source))
      .check((p) => p.isTargetInActorsManagedClinic(provider.clinicId.value))
      .orThrow(PROVIDER_EVENTS.UPDATED);

    provider.updateInfo(dto);

    await this.txManager.run(() => this.providerCommandRepo.save(provider));
  }
}
