import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetActivitiesByLeadQuery } from './get-activities-by-lead.query';
import { GetActivitiesByLeadResponse } from './get-activities-by-lead.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  ACTIVITY_QUERY_REPOSITORY,
  IActivityQueryRepository,
} from '@modules/crm/activity/domain/repositories/activity/activity.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetActivitiesByLeadQuery)
export class GetActivitiesByLeadHandler
  implements
    IQueryHandler<GetActivitiesByLeadQuery, GetActivitiesByLeadResponse>
{
  constructor(
    @Inject(ACTIVITY_QUERY_REPOSITORY)
    private readonly activityRepo: IActivityQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetActivitiesByLeadQuery
  ): Promise<GetActivitiesByLeadResponse> {
    const { leadId, pagination, ctx, clinicId } = query.payload;

    // Zaman çizelgesi aktörün kliniğine sabitlenir; leadId tek başına yetmez.
    const result = await this.activityRepo.findByLead({
      leadId,
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
