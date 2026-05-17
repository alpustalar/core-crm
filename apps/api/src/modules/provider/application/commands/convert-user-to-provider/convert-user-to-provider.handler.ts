import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IProviderRepository,
  PROVIDER_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import {
  IPolicyFactory,
  POLICY_FACTORY_TOKEN,
} from '@modules/policy/domain/interfaces/policy-factory.interface';
import { ConvertUserToProviderCommand } from '@modules/provider/application/commands/convert-user-to-provider/convert-user-to-provider.command';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';

@CommandHandler(ConvertUserToProviderCommand)
export class ConvertUserToProviderHandler
  implements ICommandHandler<ConvertUserToProviderCommand, string>
{
  constructor(
    @Inject(POLICY_FACTORY_TOKEN)
    protected readonly policyFactory: IPolicyFactory,
    @Inject(PROVIDER_REPO_TOKEN)
    private readonly providerRepo: IProviderRepository
  ) {}

  async execute(command: ConvertUserToProviderCommand) {
    const { context, dto } = command;
    const { actor, source } = context;

    if (!ExecutionPolicy.isSystemInitiated(source)) {
      const { evaluator } = this.policyFactory.user(actor);
      evaluator
        .check((p) => p.isTargetInActorsManagedClinic(dto.clinicId))
        .orThrow();
    }

    const providerRaw = await this.providerRepo.create(dto);

    return providerRaw.id;
  }
}
