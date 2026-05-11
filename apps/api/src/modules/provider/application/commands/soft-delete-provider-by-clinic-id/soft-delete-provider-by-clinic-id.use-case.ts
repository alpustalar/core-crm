import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IProviderRepository,
  PROVIDER_REPO_TOKEN,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { SoftDeleteProviderByClinicIdCommand } from './soft-delete-provider-by-clinic-id.command';

@CommandHandler(SoftDeleteProviderByClinicIdCommand)
export class SoftDeleteProviderByClinicIdHandler
  implements ICommandHandler<SoftDeleteProviderByClinicIdCommand, void>
{
  constructor(
    @Inject(PROVIDER_REPO_TOKEN)
    private readonly providerRepo: IProviderRepository
  ) {}

  async execute(command: SoftDeleteProviderByClinicIdCommand): Promise<void> {
    const { providerId, context } = command;
    const { actor, source } = context;
  }
}
