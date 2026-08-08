import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyTasksQuery } from './get-my-tasks.query';
import { GetMyTasksResponse } from './get-my-tasks.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  ACTIVITY_QUERY_REPOSITORY,
  IActivityQueryRepository,
} from '@modules/crm/activity/domain/repositories/activity/activity.query.repository';

@QueryHandler(GetMyTasksQuery)
export class GetMyTasksHandler
  implements IQueryHandler<GetMyTasksQuery, GetMyTasksResponse>
{
  constructor(
    @Inject(ACTIVITY_QUERY_REPOSITORY)
    private readonly activityRepo: IActivityQueryRepository
  ) {}

  async execute(query: GetMyTasksQuery): Promise<GetMyTasksResponse> {
    const { data, pagination, ctx } = query.payload;
    const { actor } = ctx;

    const result = await this.activityRepo.findMyTasks({
      assignedToId: actor.userId,
      clinicId: actor.clinicId,
      status: data.status,
      pagination,
    });

    return {
      data: result.items,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
