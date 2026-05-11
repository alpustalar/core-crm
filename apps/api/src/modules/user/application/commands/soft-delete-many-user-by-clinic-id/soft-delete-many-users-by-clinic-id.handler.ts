// soft-delete-users-by-clinic-id.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserRepository,
  USER_REPO_TOKEN,
} from '@modules/user/domain/repositories/user.repository';
import { UserStatus } from '@prisma/client';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { SoftDeleteManyUsersByClinicIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.command';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER_TOKEN,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';

@CommandHandler(SoftDeleteManyUsersByClinicIdCommand)
export class SoftDeleteManyUsersByClinicIdHandler
  implements ICommandHandler<SoftDeleteManyUsersByClinicIdCommand, number>
{
  constructor(
    @Inject(USER_REPO_TOKEN)
    private readonly userRepo: IUserRepository,
    @Inject(USER_EVENT_PUBLISHER_TOKEN)
    private readonly userEventPublisher: IUserEventPublisher
  ) {}

  @InternalOnly()
  async execute(command: SoftDeleteManyUsersByClinicIdCommand) {
    const result = await this.userRepo.changeAllUserStatusInClinicWithClinicId(
      command.clinicId,
      UserStatus.DELETED
    );

    return result.deletedCount;
  }
}
