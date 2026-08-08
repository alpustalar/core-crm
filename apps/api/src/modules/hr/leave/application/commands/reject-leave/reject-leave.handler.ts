import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectLeaveCommand } from './reject-leave.command';
import { LeaveNotFoundException } from '@modules/hr/leave/domain/exceptions/leave.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { LEAVE_EVENTS } from '@src/domain/constants/events';
import {
  ILeaveCommandRepository,
  LEAVE_COMMAND_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave/leave.command.repository';

@CommandHandler(RejectLeaveCommand)
export class RejectLeaveHandler
  implements ICommandHandler<RejectLeaveCommand, void>
{
  constructor(
    @Inject(LEAVE_COMMAND_REPOSITORY)
    private readonly leaveRepo: ILeaveCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RejectLeaveCommand): Promise<void> {
    const { leaveId, data, ctx } = command.payload;

    await this.txManager.run(async () => {
      const leave = await this.leaveRepo.findById(leaveId);
      if (!leave) throw new LeaveNotFoundException(leaveId);

      this.policyFactory
        .employee(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canManageClinicHr(leave.clinicId.value))
        .orThrow(LEAVE_EVENTS.REJECTED);

      leave.reject(ctx.actor.userId, data.note);
      await this.leaveRepo.update(leave);
    });
  }
}
