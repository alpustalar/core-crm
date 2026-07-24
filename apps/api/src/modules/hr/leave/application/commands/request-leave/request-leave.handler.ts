import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestLeaveCommand } from './request-leave.command';
import {
  ILeaveCommandRepository,
  LEAVE_COMMAND_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave.repository';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { LEAVE_EVENTS } from '@src/domain/constants/events';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicOrganizationIdQuery } from '@modules/organization/clinic/application/queries/get-clinic-organization-id/get-clinic-organization-id.query';

@CommandHandler(RequestLeaveCommand)
export class RequestLeaveHandler
  implements ICommandHandler<RequestLeaveCommand, string>
{
  constructor(
    @Inject(LEAVE_COMMAND_REPOSITORY)
    private readonly leaveCommandRepo: ILeaveCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly txManager: TransactionManager,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(command: RequestLeaveCommand): Promise<string> {
    const { employeeId, data, ctx } = command.payload;

    const { data: organizationId } = await this.queryBus.execute(
      new GetClinicOrganizationIdQuery(data.clinicId)
    );

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicHr(data.clinicId))
      .orThrow(LEAVE_EVENTS.REQUESTED);

    const leave = LeaveRequest.create({
      employeeId,
      organizationId,
      clinicId: data.clinicId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
    });

    return this.txManager.run(async () => {
      const saved = await this.leaveCommandRepo.create(leave);
      return saved.id.value;
    });
  }
}
