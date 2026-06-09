import {
  IOrganizationCommandRepository,
  IOrganizationQueryRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
  ORGANIZATION_QUERY_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization.repository.interface';
import {
  IOrganizationEventPublisher,
  ORGANIZATION_EVENT_PUBLISHER,
} from '@modules/organization/organization/domain/interfaces/organization-event-publisher.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CreateAdminRequestCommand } from '@modules/platform/admin-request/application/commands/create-admin-request/create-admin-request.command';
import { AdminRequestType } from '@shared/modules/admin-request/types';
import { SoftDeleteOrganizationCommand } from './soft-delete-organization.command';
import { SoftDeleteOrganizationCommandResponse } from './soft-delete-organization.response';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

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
    @Inject(ORGANIZATION_EVENT_PUBLISHER)
    private readonly eventPublisher: IOrganizationEventPublisher,
    private readonly commandBus: TSCommandBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: SoftDeleteOrganizationCommand
  ): Promise<SoftDeleteOrganizationCommandResponse> {
    const { organizationId, ctx } = command;

    return this.transactionManager.run(async () => {
      const organization =
        await this.organizationQueryRepo.findById(organizationId);
      if (!organization)
        throw new NotFoundException('Organizasyon bulunamadı.');

      if (ExecutionPolicy.isSystemInitiated(ctx.source)) {
        organization.softDelete(ctx.actor.userId);
        await this.organizationCommandRepo.save(organization);
        return organization.id;
      }

      const adminRequestId = await this.commandBus.execute(
        new CreateAdminRequestCommand(
          {
            type: AdminRequestType.ORGANIZATION_DELETION,
            targetId: organizationId,
          },
          ctx
        )
      );

      this.eventPublisher.deletionRequested({
        organizationId,
        organizationName: organization.name,
        adminRequestId,
        actorEmail: ctx.actor.email,
      });

      return adminRequestId;
    });
  }
}
