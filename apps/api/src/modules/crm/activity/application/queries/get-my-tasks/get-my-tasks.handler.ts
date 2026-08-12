import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyTasksQuery } from './get-my-tasks.query';
import { GetMyTasksResponse } from './get-my-tasks.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  ACTIVITY_QUERY_REPOSITORY,
  IActivityQueryRepository,
} from '@modules/crm/activity/domain/repositories/activity/activity.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetMyTasksQuery)
export class GetMyTasksHandler
  implements IQueryHandler<GetMyTasksQuery, GetMyTasksResponse>
{
  constructor(
    @Inject(ACTIVITY_QUERY_REPOSITORY)
    private readonly activityRepo: IActivityQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetMyTasksQuery): Promise<GetMyTasksResponse> {
    const { filter, pagination, ctx, clinicId } = query.payload;

    const result = await this.activityRepo.findMyTasks({
      assignedToId: ctx.actor.userId,
      status: filter.status,
      clinicId,
      pagination,
    });

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
        serializationOptions: this.policyFactory
          .clinic(ctx.actor, ctx.source)
          .policy.getSerializationOptions({ clinicId }),
      },
    };
  }
}
