import {
  IOrganizationEventPublisher,
  ORGANIZATION_EVENT_PUBLISHER,
} from '@modules/organization/organization/domain/interfaces/organization-event-publisher.interface';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { ExecutionPolicy } from '@src/domain/common/execution/execution.policy';
import { CreateAdminRequestCommand } from '@modules/platform/admin-request/application/commands/create-admin-request/create-admin-request.command';
import { AdminRequestType } from '@shared/modules/admin-request/types';
import { SoftDeleteOrganizationCommand } from './soft-delete-organization.command';
import { SoftDeleteOrganizationCommandResponse } from './soft-delete-organization.response';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  IOrganizationCommandRepository,
  ORGANIZATION_COMMAND_REPOSITORY,
} from '@modules/organization/organization/domain/repositories/organization/organization.command.repository';
import { OrganizationNotFoundException } from '@modules/organization/organization/domain/exceptions/organization.exceptions';

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
    private readonly eventPublisher: IOrganizationEventPublisher,
    private readonly commandBus: TSCommandBus,
    private readonly transactionManager: TransactionManager
  ) {}

  async execute(
    command: SoftDeleteOrganizationCommand
  ): Promise<SoftDeleteOrganizationCommandResponse> {
    const { organizationId, ctx } = command;

    return this.transactionManager.run(async () => {
      const organization = await this.organizationRepo.findById(organizationId);

      if (!organization) throw new OrganizationNotFoundException();

      if (ExecutionPolicy.isSystemInitiated(ctx.source)) {
        organization.softDelete(ctx.actor.userId);
        await this.organizationRepo.update(organization);
        return organization.id.value;
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
        organizationName: organization.name.value,
        adminRequestId,
        actorEmail: ctx.actor.email,
      });

      return adminRequestId;
    });
  }
}
