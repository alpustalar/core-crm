import { PROVIDER_EVENTS } from '@src/domain/constants/events';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ConvertUserToProviderCommand } from '@modules/clinical/provider/application/commands/convert-user-to-provider/convert-user-to-provider.command';
import { ConvertUserToProviderResponse } from '@modules/clinical/provider/application/commands/convert-user-to-provider/convert-user-to-provider.response';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/clinical/provider/domain/repositories/provider.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Provider } from '@modules/clinical/provider/domain/entities/provider.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

@CommandHandler(ConvertUserToProviderCommand)
export class ConvertUserToProviderHandler
  implements
    ICommandHandler<
      ConvertUserToProviderCommand,
      ConvertUserToProviderResponse
    >
{
  constructor(
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerCommandRepo: IProviderCommandRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: ConvertUserToProviderCommand
  ): Promise<ConvertUserToProviderResponse> {
    this.policyFactory
      .provider(command.ctx.actor, command.ctx.source)
      .evaluator.check((p) =>
        p.isTargetInActorsSameClinic(command.data.clinicId)
      )
      .orThrow(PROVIDER_EVENTS.CREATED);

    const provider = Provider.create(command.data);

    await this.transactionManager.run(() =>
      this.providerCommandRepo.create(provider)
    );
  }
}
