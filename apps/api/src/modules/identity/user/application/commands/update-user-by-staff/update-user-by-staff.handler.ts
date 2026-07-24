import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { UpdateUserByStaffResponse } from '@modules/identity/user/application/commands/update-user-by-staff/update-user-by-staff.response';
import {
  IUserCommandRepository,
  USER_COMMAND_REPOSITORY,
} from '@modules/identity/user/domain/repositories/user.repository';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { USER_EVENTS } from '@src/domain/constants/events';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction';
import { UpdateUserByStaffCommand } from './update-user-by-staff.command';
import { UserNotFoundException } from '@modules/identity/user/domain/exceptions/user.exceptions';

@CommandHandler(UpdateUserByStaffCommand)
export class UpdateUserByStaffHandler
  implements
    ICommandHandler<UpdateUserByStaffCommand, UpdateUserByStaffResponse>
{
  constructor(
    @Inject(USER_COMMAND_REPOSITORY)
    private readonly userCommandRepo: IUserCommandRepository,
    @Inject(POLICY_FACTORY)
    protected readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(
    command: UpdateUserByStaffCommand
  ): Promise<UpdateUserByStaffResponse> {
    const { targetUserId, data, ctx } = command.payload;

    const hasOwnedOrgs = !!data.ownedOrganizationIds?.length;
    const hasManagedClinics = !!data.managedClinicIds?.length;

    this.policyFactory
      .user(ctx.actor, ctx.source)
      .evaluator.bypassIf(!(!!data.roleId || hasOwnedOrgs || hasManagedClinics))
      .check(
        (p) => p.isSelf(targetUserId),
        'Kendi yetkilerinizi buradan değiştiremezsiniz.'
      );

    const targetUser = await this.userCommandRepo.findById(targetUserId);

    if (!targetUser) throw new UserNotFoundException();

    this.policyFactory
      .user(ctx.actor, ctx.source)
      .evaluator.check(
        (p) =>
          p.actorCanUpdateTargetUser(
            targetUser.role?.priority,
            targetUser.clinicId?.value
          ),
        'Bu işlem için yeterli yetkiye sahip değilsiniz.'
      )
      .orThrow(USER_EVENTS.UPDATE);

    targetUser.updateDetails(data, ctx.actor.userId);

    await this.txManager.run(async () => {
      await this.userCommandRepo.save(targetUser);
    });
  }
}
