import { SoftDeleteManyUserByOrganizationIdCommand } from '@modules/identity/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-users-by-organization-id.command';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { SoftDeleteManyUserByOrganizationIdResponse } from '@modules/identity/user/application/commands/soft-delete-many-user-by-organization-id/soft-delete-many-user-by-organization-id.response';
import { RedisService } from '@src/infrastructure/cache/redis/redis.service';

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
    private readonly redis: RedisService
  ) {}

  @InternalOnly()
  async execute(
    command: SoftDeleteManyUserByOrganizationIdCommand
  ): Promise<SoftDeleteManyUserByOrganizationIdResponse> {
    const { organizationId } = command;
    const { ids } =
      await this.userRepo.softDeleteAllByOrganizationId(organizationId);
    await Promise.all(ids.map((id) => this.redis.deleteActorContext(id)));
  }
}
