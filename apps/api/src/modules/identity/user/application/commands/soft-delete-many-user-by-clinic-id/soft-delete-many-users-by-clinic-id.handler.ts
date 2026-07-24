import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { SoftDeleteManyUsersByClinicIdCommand } from '@modules/identity/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-users-by-clinic-id.command';
import { SoftDeleteManyUserByClinicIdResponse } from '@modules/identity/user/application/commands/soft-delete-many-user-by-clinic-id/soft-delete-many-user-by-clinic-id.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';

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
    private readonly userCommandRepo: IUserCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  @InternalOnly()
  async execute(command: SoftDeleteManyUsersByClinicIdCommand): Promise<void> {
    await this.txManager.run(async () => {
      return await this.userCommandRepo.softDeleteAllByClinicIds(
        command.clinicId
      );
    });
  }
}
