import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPendingLeavesQuery } from './get-pending-leaves.query';
import { GetPendingLeavesResponse } from './get-pending-leaves.response';
import {
  ILeaveQueryRepository,
  LEAVE_QUERY_REPOSITORY,
} from '@modules/hr/leave/domain/repositories/leave.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { LEAVE_EVENTS } from '@src/domain/constants/events';

@QueryHandler(GetPendingLeavesQuery)
export class GetPendingLeavesHandler
  implements IQueryHandler<GetPendingLeavesQuery, GetPendingLeavesResponse>
{
  constructor(
    @Inject(LEAVE_QUERY_REPOSITORY)
    private readonly leaveQueryRepo: ILeaveQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetPendingLeavesQuery
  ): Promise<GetPendingLeavesResponse> {
    const { pagination, ctx, clinicId } = query.payload;

    this.policyFactory
      .employee(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessClinicHr(clinicId))
      .orThrow(LEAVE_EVENTS.PENDING);

    const result = await this.leaveQueryRepo.findPendingByClinic({
      clinicId,
      pagination,
    });

    return {
      data: result.items,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
