import { SoftDeleteManyUserByOrganizationIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { SoftDeleteManyUserByOrganizationIdResponse } from '@modules/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-user-by-organization-id.response';
import { RedisService } from '@common/redis/redis.service';

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
    private readonly redis: RedisService,
  ) {}

  @InternalOnly()
  async execute(
    command: SoftDeleteManyUserByOrganizationIdCommand
  ): Promise<SoftDeleteManyUserByOrganizationIdResponse> {
    const { organizationId } = command;
    const { ids } = await this.userRepo.softDeleteAllByOrganizationId(organizationId);
    await Promise.all(ids.map((id) => this.redis.deleteActorContext(id)));
  }
}
