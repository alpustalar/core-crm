import { SoftDeleteManyUserByOrganizationIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { SoftDeleteManyUserByOrganizationIdResponse } from '@modules/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-user-by-organization-id.response';

@CommandHandler(SoftDeleteManyUserByOrganizationIdCommand)
export class SoftDeleteManyUsersByOrganizationIdHandler
  implements
    ICommandHandler<
      SoftDeleteManyUserByOrganizationIdCommand,
      SoftDeleteManyUserByOrganizationIdResponse
    >
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(USER_EVENT_PUBLISHER)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  @InternalOnly()
  async execute(
    command: SoftDeleteManyUserByOrganizationIdCommand
  ): Promise<SoftDeleteManyUserByOrganizationIdResponse> {
    const { organizationId } = command;
    await this.userRepo.softDeleteAllByOrganizationId(organizationId);
  }
}
