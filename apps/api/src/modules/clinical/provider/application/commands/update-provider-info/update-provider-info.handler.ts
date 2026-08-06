import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { UpdateProviderInfoCommand } from './update-provider-info.command';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { ProviderNotFoundException } from '@modules/clinical/provider/domain/exceptions/provider.exceptions';
import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider/provider.command.repository.interface';

@CommandHandler(UpdateProviderInfoCommand)
export class UpdateProviderInfoHandler
  implements ICommandHandler<UpdateProviderInfoCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerRepo: IProviderCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: UpdateProviderInfoCommand): Promise<void> {
    const { payload } = command;
    const { providerId, data, ctx } = payload;

    const provider = await this.providerRepo.findById(providerId);
    if (!provider) throw new ProviderNotFoundException();

    this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.actorCanManageTargetClinic(provider.clinicId.value)
      )
      .orThrow(PROVIDER_EVENTS.UPDATED);

    provider.updateInfo(data);

    await this.txManager.run(() => this.providerRepo.update(provider));
  }
}
