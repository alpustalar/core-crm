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
import { SoftDeleteProviderByClinicIdCommand } from '@modules/clinical/provider/application/commands';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';

@CommandHandler(SoftDeleteProviderByClinicIdCommand)
export class SoftDeleteProviderByClinicIdHandler
  implements ICommandHandler<SoftDeleteProviderByClinicIdCommand, void>
{
  constructor(
    @Inject(PROVIDER_QUERY_REPOSITORY)
    private readonly providerQueryRepo: IProviderQueryRepository,
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerCommandRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(command: SoftDeleteProviderByClinicIdCommand): Promise<void> {
    const { providerId, ctx } = command;
    const { actor, source } = ctx;

    const provider = await this.providerQueryRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundException();

    const { evaluator } = this.policyFactory.user(actor);
    evaluator
      .bypassIf(ExecutionPolicy.isSystemInitiated(source))
      .check((p) => p.isTargetInActorsManagedClinic(provider.clinicId.value))
      .orThrow(PROVIDER_EVENTS.SOFT_DELETED);

    provider.softDelete();

    await this.transactionManager.run(() =>
      this.providerCommandRepo.save(provider)
    );
  }
}
