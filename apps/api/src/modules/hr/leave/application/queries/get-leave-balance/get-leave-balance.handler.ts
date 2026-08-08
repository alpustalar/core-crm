import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeaveBalanceQuery } from './get-leave-balance.query';
import { GetLeaveBalanceResponse } from './get-leave-balance.response';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetEmployeeByIdQuery } from '@modules/hr/employee/application/queries/get-employee-by-id/get-employee-by-id.query';
import { LeaveBalance } from '@modules/hr/leave/domain/value-objects/leave-balance.vo';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  ILeaveQueryRepository,
  LEAVE_QUERY_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave/leave.query.repository';

@QueryHandler(GetLeaveBalanceQuery)
export class GetLeaveBalanceHandler
  implements IQueryHandler<GetLeaveBalanceQuery, GetLeaveBalanceResponse>
{
  constructor(
    @Inject(LEAVE_QUERY_REPOSITORY)
    private readonly leaveRepo: ILeaveQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(query: GetLeaveBalanceQuery): Promise<GetLeaveBalanceResponse> {
    const { employeeId, ctx } = query;

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicHr(ctx.actor.clinicId))
      .orThrow('leave.balance');

    // Hak ediş çalışan modülünden (cross-module, QueryBus).
    const { data: employee } = await this.queryBus.execute(
      new GetEmployeeByIdQuery(employeeId, ctx)
    );

    // İzin yılı tanımı ve bakiye aritmetiği domain'de (LeaveBalance) — handler
    // yalnız veriyi toplayıp hesabı domain'e devreder.
    const { from, to } = LeaveBalance.periodOf();
    const usedDays = await this.leaveRepo.sumApprovedAnnualDays(
      employeeId,
      from,
      to
    );

    const balance = LeaveBalance.calculate({
      entitlement: employee?.annualLeaveEntitlement ?? 0,
      usedDays,
    });

    return { data: balance.toView() };
  }
}
