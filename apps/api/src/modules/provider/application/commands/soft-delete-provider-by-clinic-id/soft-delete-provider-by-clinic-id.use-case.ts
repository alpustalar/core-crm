import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  IProviderCommandRepository,
  PROVIDER_COMMAND_REPOSITORY,
} from '@modules/provider/domain/repositories/provider.repository.interface';
import { SoftDeleteProviderByClinicIdCommand } from '@modules/provider/application/commands';

@CommandHandler(SoftDeleteProviderByClinicIdCommand)
export class SoftDeleteProviderByClinicIdHandler
  implements ICommandHandler<SoftDeleteProviderByClinicIdCommand, void>
{
  constructor(
    @Inject(PROVIDER_COMMAND_REPOSITORY)
    private readonly providerCommandRepo: IProviderCommandRepository
  ) {}

  async execute(command: SoftDeleteProviderByClinicIdCommand): Promise<void> {
    const { providerId } = command;
    await this.providerCommandRepo.softDelete(providerId);
  }
}
