import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeavesByEmployeeQuery } from './get-leaves-by-employee.query';
import { GetLeavesByEmployeeResponse } from './get-leaves-by-employee.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  ILeaveQueryRepository,
  LEAVE_QUERY_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave/leave.query.repository';

@QueryHandler(GetLeavesByEmployeeQuery)
export class GetLeavesByEmployeeHandler
  implements
    IQueryHandler<GetLeavesByEmployeeQuery, GetLeavesByEmployeeResponse>
{
  constructor(
    @Inject(LEAVE_QUERY_REPOSITORY)
    private readonly leaveRepo: ILeaveQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetLeavesByEmployeeQuery
  ): Promise<GetLeavesByEmployeeResponse> {
    const { employeeId, filter, pagination, ctx } = query.payload;

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicHr(ctx.actor.clinicId))
      .orThrow('leave.list');

    const result = await this.leaveRepo.findByEmployee({
      employeeId,
      status: filter.status,
      pagination,
    });

    return {
      data: result.items,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
