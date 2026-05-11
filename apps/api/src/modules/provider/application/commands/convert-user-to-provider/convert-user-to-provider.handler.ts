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
import { ProviderCommandsPrismaMapper } from '@modules/provider/infrastructure/persistence/prisma/mappers/provider-commands-prisma.mapper';

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
    const { actor } = context;

    const { evaluator } = this.policyFactory.user(actor);

    evaluator
      .check((p) => p.isTargetInActorsManagedClinic(dto.clinicId))
      .orThrow();

    const input = ProviderCommandsPrismaMapper.toCreateInput(dto);

    const providerRaw = await this.providerRepo.create(input);

    return providerRaw.id;
  }
}
