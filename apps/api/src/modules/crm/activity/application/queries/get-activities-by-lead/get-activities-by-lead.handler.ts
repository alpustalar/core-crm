import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActivitiesByLeadQuery } from './get-activities-by-lead.query';
import { GetActivitiesByLeadResponse } from './get-activities-by-lead.response';
import {
  ACTIVITY_QUERY_REPOSITORY,
  IActivityQueryRepository,
} from '@modules/crm/activity/domain/repositories/activity.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetActivitiesByLeadQuery)
export class GetActivitiesByLeadHandler
  implements
    IQueryHandler<GetActivitiesByLeadQuery, GetActivitiesByLeadResponse>
{
  constructor(
    @Inject(ACTIVITY_QUERY_REPOSITORY)
    private readonly activityQueryRepo: IActivityQueryRepository
  ) {}

  async execute(
    query: GetActivitiesByLeadQuery
  ): Promise<GetActivitiesByLeadResponse> {
    const { leadId, pagination } = query.payload;

    const result = await this.activityQueryRepo.findByLead({
      leadId,
      pagination,
    });

    return {
      data: result.items.map((item) => item.toPersistence()),
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
