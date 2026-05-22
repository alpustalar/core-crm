import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { ConvertUserToProviderCommand } from '@modules/provider/application/commands/convert-user-to-provider/convert-user-to-provider.command';
import { ConvertUserToProviderResponse } from '@modules/provider/application/commands/convert-user-to-provider/convert-user-to-provider.response';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';

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
    private readonly providerCommandRepo: IProviderCommandRepository
  ) {}

  async execute(
    command: ConvertUserToProviderCommand
  ): Promise<ConvertUserToProviderResponse> {
    const { ctx, dto } = command;
    const { actor, source } = ctx;

    if (!ExecutionPolicy.isSystemInitiated(source)) {
      const { evaluator } = this.policyFactory.user(actor);
      evaluator
        .check((p) => p.isTargetInActorsManagedClinic(dto.clinicId))
        .orThrow();
    }

    await this.providerCommandRepo.create(dto);
  }
}
