import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SoftDeleteUserByStaffCommand } from '@modules/identity/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { SoftDeleteUserByStaffResponse } from '@modules/identity/user/application/commands/soft-delete-user-by-staff/soft-delete-user-by-staff.response';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { USER_EVENTS } from '@src/domain/constants/events';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user/user.command.repository';

@CommandHandler(SoftDeleteUserByStaffCommand)
export class SoftDeleteUserByStaffHandler
  implements
    ICommandHandler<
      SoftDeleteUserByStaffCommand,
      SoftDeleteUserByStaffResponse
    >
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userRepo: IUserCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: SoftDeleteUserByStaffCommand
  ): Promise<SoftDeleteUserByStaffResponse> {
    const { data, ctx } = command;
    const { actor, source } = ctx;

    this.policyFactory
      .user(actor, source)
      .evaluator.check(
        (p) => p.isTargetInActorsManagedClinic(data.clinicId),
        'Bu yetkiye sahip değilsiniz'
      )
      .orThrow(USER_EVENTS.SOFT_DELETED);

    const user = await this.userRepo.findById(data.userId);

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    user.softDelete(actor.userId);

    await this.txManager.run(async () => {
      await this.userRepo.update(user);
    });
  }
}
