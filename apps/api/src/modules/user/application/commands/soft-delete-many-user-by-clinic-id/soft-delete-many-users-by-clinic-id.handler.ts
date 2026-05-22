// soft-delete-users-by-clinic-id.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/user/domain/repositories/user.repository';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { SoftDeleteManyUsersByClinicIdCommand } from '@modules/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.command';
import {
  IUserEventPublisher,
  USER_EVENT_PUBLISHER,
} from '@modules/user/domain/interfaces/user-event-publisher.interface';
import { GlobalStatusSchema } from '@input-type-schemas/GlobalStatusSchema';
import { SoftDeleteManyUserByClinicIdResponse } from '@modules/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-user-by-clinic-id.response';

@CommandHandler(SoftDeleteManyUsersByClinicIdCommand)
export class SoftDeleteManyUsersByClinicIdHandler
  implements
    ICommandHandler<
      SoftDeleteManyUsersByClinicIdCommand,
      SoftDeleteManyUserByClinicIdResponse
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
    command: SoftDeleteManyUsersByClinicIdCommand
  ): Promise<SoftDeleteManyUserByClinicIdResponse> {
    await this.userRepo.changeAllStatusByClinicId(
      command.clinicId,
      GlobalStatusSchema.enum.DELETED
    );
  }
}
