import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RequestLeaveCommand } from './request-leave.command';
import { LeaveRequest } from '@modules/hr/leave/domain/entities/leave-request.entity';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { LEAVE_EVENTS } from '@src/domain/constants/events';
import {
  ITenantScopeResolver,
  TENANT_SCOPE_RESOLVER,
} from '@modules/organization/clinic/domain/services/tenant-scope/tenant-scope.resolver.interface';
import {
  ILeaveCommandRepository,
  LEAVE_COMMAND_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave/leave.command.repository';

@CommandHandler(RequestLeaveCommand)
export class RequestLeaveHandler
  implements ICommandHandler<RequestLeaveCommand, string>
{
  constructor(
    @Inject(LEAVE_COMMAND_REPOSITORY)
    private readonly leaveRepo: ILeaveCommandRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    @Inject(TENANT_SCOPE_RESOLVER)
    private readonly tenantScopeResolver: ITenantScopeResolver,
    private readonly txManager: TransactionManager
  ) {}

  async execute(command: RequestLeaveCommand): Promise<string> {
    const { employeeId, data, ctx } = command.payload;

    const organizationId = await this.tenantScopeResolver.resolve(data);

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
      const saved = await this.leaveRepo.create(leave);
      return saved.id.value;
    });
  }
}
