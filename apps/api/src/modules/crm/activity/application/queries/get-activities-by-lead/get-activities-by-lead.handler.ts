import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActivitiesByLeadQuery } from './get-activities-by-lead.query';
import { GetActivitiesByLeadResponse } from './get-activities-by-lead.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  ACTIVITY_QUERY_REPOSITORY,
  IActivityQueryRepository,
} from '@modules/crm/activity/domain/repositories/activity/activity.query.repository';

@QueryHandler(GetActivitiesByLeadQuery)
export class GetActivitiesByLeadHandler
  implements
    IQueryHandler<GetActivitiesByLeadQuery, GetActivitiesByLeadResponse>
{
  constructor(
    @Inject(ACTIVITY_QUERY_REPOSITORY)
    private readonly activityRepo: IActivityQueryRepository
  ) {}

  async execute(
    query: GetActivitiesByLeadQuery
  ): Promise<GetActivitiesByLeadResponse> {
    const { leadId, pagination } = query.payload;

    const result = await this.activityRepo.findByLead({
      leadId,
      pagination,
    });

    return {
      data: result.items,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
