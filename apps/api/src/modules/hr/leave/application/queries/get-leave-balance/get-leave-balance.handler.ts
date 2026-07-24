import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeaveBalanceQuery } from './get-leave-balance.query';
import { GetLeaveBalanceResponse } from './get-leave-balance.response';
import {
  ILeaveQueryRepository,
  LEAVE_QUERY_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave.repository';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetEmployeeByIdQuery } from '@modules/hr/employee/application/queries/get-employee-by-id/get-employee-by-id.query';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetLeaveBalanceQuery)
export class GetLeaveBalanceHandler
  implements IQueryHandler<GetLeaveBalanceQuery, GetLeaveBalanceResponse>
{
  constructor(
    @Inject(LEAVE_QUERY_REPOSITORY)
    private readonly leaveQueryRepo: ILeaveQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetLeaveBalanceQuery
  ): Promise<GetLeaveBalanceResponse> {
    const { employeeId, ctx } = query;

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canManageClinicHr(ctx.actor.clinicId))
      .orThrow('leave.balance');

    // Hak ediş çalışan modülünden (cross-module, QueryBus).
    const { data: employee } = await this.queryBus.execute(
      new GetEmployeeByIdQuery(employeeId, ctx)
    );
    const entitlement = employee?.annualLeaveEntitlement ?? 0;

    // İçinde bulunulan takvim yılının onaylı ANNUAL gün toplamı.
    const year = new Date().getUTCFullYear();
    const from = new Date(Date.UTC(year, 0, 1));
    const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    const used = await this.leaveQueryRepo.sumApprovedAnnualDays(
      employeeId,
      from,
      to
    );

    return {
      data: { entitlement, used, remaining: entitlement - used },
    };
  }
}
