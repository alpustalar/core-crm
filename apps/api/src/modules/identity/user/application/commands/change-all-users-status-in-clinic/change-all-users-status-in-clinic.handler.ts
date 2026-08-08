import { Inject } from '@nestjs/common';
import { ChangeAllUsersStatusInClinicCommand } from '@modules/identity/user/application/commands/change-all-users-status-in-clinic/change-all-users-status-in-clinic.command';
import { InternalOnly } from '@common/decorators/internal-only.decorator';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeAllUsersStatusInClinicResponse } from '@modules/identity/user/application/commands/change-all-users-status-in-clinic/change-all-users-status-in-clinic.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.command.repository';

@CommandHandler(ChangeAllUsersStatusInClinicCommand)
export class ChangeAllUsersStatusInClinicHandler
  implements
    ICommandHandler<
      ChangeAllUsersStatusInClinicCommand,
      ChangeAllUsersStatusInClinicResponse
    >
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    private readonly txManager: TransactionManager
  ) {}

  @InternalOnly()
  async execute(
    command: ChangeAllUsersStatusInClinicCommand
  ): Promise<ChangeAllUsersStatusInClinicResponse> {
    const { status, clinicId } = command;
    // Dönüş void; toplu güncelleme sonrası kullanıcıları tekrar okumanın karşılığı
    // yoktu (sonuç atılıyordu) — okuma kaldırıldı.
    await this.txManager.run(() =>
      this.userRepo.changeStatus(status, clinicId)
    );
  }
}
