import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelLeaveCommand } from './cancel-leave.command';
import {
  ILeaveCommandRepository,
  LEAVE_COMMAND_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave.repository';
import { LeaveNotFoundException } from '@modules/hr/leave/domain/exceptions/leave.exceptions';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { LEAVE_EVENTS } from '@src/domain/constants/events';

@CommandHandler(CancelLeaveCommand)
export class CancelLeaveHandler
  implements ICommandHandler<CancelLeaveCommand, void>
{
  constructor(
    @Inject(LEAVE_COMMAND_REPOSITORY)
    private readonly leaveCommandRepo: ILeaveCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: CancelLeaveCommand): Promise<void> {
    const { leaveId, ctx } = command;

    await this.txManager.run(async () => {
      const leave = await this.leaveCommandRepo.findById(leaveId);
      if (!leave) throw new LeaveNotFoundException(leaveId);

      this.policyFactory
        .employee(ctx.actor, ctx.source)
        .evaluator.check((p) => p.canAccessClinicHr(leave.clinicId.value))
        .orThrow(LEAVE_EVENTS.CANCELLED);

      const validateOptions = this.policyFactory
        .entity(ctx.actor, ctx.source)
        .policy.getValidateOptions();

      leave.rules(validateOptions).cancel().orThrow();
      leave.cancel();

      await this.leaveCommandRepo.save(leave);
    });
  }
}
