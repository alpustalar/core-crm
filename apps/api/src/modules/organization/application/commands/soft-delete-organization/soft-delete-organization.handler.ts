import { InternalOnly } from '@common/decorators';
import {
  IOrganizationCommandRepository,
  IOrganizationQueryRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
  ORGANIZATION_QUERY_REPOSITORY,
} from '@modules/organization/domain/repositories/organization.repository.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { SoftDeleteOrganizationCommand } from './soft-delete-organization.command';
import { SoftDeleteOrganizationCommandResponse } from './soft-delete-organization.response';

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
    private readonly organizationCommandRepo: IOrganizationCommandRepository,
    @Inject(ORGANIZATION_QUERY_REPOSITORY)
    private readonly organizationQueryRepo: IOrganizationQueryRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  @InternalOnly()
  async execute(
    command: SoftDeleteOrganizationCommand,
  ): Promise<SoftDeleteOrganizationCommandResponse> {
    const { organizationId, ctx } = command;

    return this.transactionManager.run(async () => {
      const organization = await this.organizationQueryRepo.findById(organizationId);
      if (!organization) {
        throw new NotFoundException('Organizasyon bulunamadı.');
      }

      organization.softDelete(ctx.actor.userId);
      await this.organizationCommandRepo.save(organization);

      return organization.id;
    });
  }
}
