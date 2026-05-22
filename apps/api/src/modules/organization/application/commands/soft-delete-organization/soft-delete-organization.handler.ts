import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteOrganizationCommand } from './soft-delete-organization.command';
import { SoftDeleteOrganizationCommandResponse } from './soft-delete-organization.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import {
  IOrganizationCommandRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
} from '@modules/organization/domain/repositories/organization.repository.interface';
import { Inject } from '@nestjs/common';
import { InternalOnly } from '@common/decorators';
import {
  IOrganizationEventPublisher,
  ORGANIZATION_EVENT_PUBLISHER,
} from '@modules/organization/domain/interfaces/organization-event-publisher.interface';

@CommandHandler(SoftDeleteOrganizationCommand)
export class SoftDeleteOrganizationHandler
  implements
    ICommandHandler<
      SoftDeleteOrganizationCommand,
      SoftDeleteOrganizationCommandResponse
    >
{
  constructor(
    @Inject(ORGANIZATION_COMMAND_REPOSITORY)
    private readonly organizationRepo: IOrganizationCommandRepository,
    @Inject(ORGANIZATION_EVENT_PUBLISHER)
    private readonly organizationEventPublisher: IOrganizationEventPublisher,
    private readonly transactionManager: TransactionManager
  ) {}

  @InternalOnly()
  async execute(
    command: SoftDeleteOrganizationCommand
  ): Promise<SoftDeleteOrganizationCommandResponse> {
    const { organizationId } = command;

    return await this.transactionManager.run(async () => {
      const organization =
        await this.organizationRepo.softDelete(organizationId);

      return {
        id: organization.id,
      };
    });
  }
}
