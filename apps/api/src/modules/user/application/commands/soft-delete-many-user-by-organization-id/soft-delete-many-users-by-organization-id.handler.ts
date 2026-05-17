import { SoftDeleteManyUserByOrganizationIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER_TOKEN,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { InternalOnly } from '@common/decorators/internal-only.decorator';

@CommandHandler(SoftDeleteManyUserByOrganizationIdCommand)
export class SoftDeleteManyUsersByOrganizationIdHandler
  implements ICommandHandler<SoftDeleteManyUserByOrganizationIdCommand>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(USER_EVENT_PUBLISHER_TOKEN)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  @InternalOnly()
  async execute(command: SoftDeleteManyUserByOrganizationIdCommand) {
    const { organizationId } = command;

    const result =
      await this.userRepo.softDeleteAllByOrganizationId(organizationId);

    return result.deletedCount;
  }
}
