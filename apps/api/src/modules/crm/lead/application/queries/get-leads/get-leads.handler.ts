import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLeadsQuery } from './get-leads.query';
import { GetLeadsResponse } from './get-leads.response';
import {
  ILeadQueryRepository,
  LEAD_QUERY_REPOSITORY,
} from '@modules/crm/lead/domain/repositories/lead.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetLeadsQuery)
export class GetLeadsHandler
  implements IQueryHandler<GetLeadsQuery, GetLeadsResponse>
{
  constructor(
    @Inject(LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: ILeadQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetLeadsQuery): Promise<GetLeadsResponse> {
    const { clinicId, data, pagination, ctx } = query.payload;

    const result = await this.leadQueryRepo.findMany({
      clinicId,
      status: data.status,
      source: data.source,
      assignedToId: data.assignedToId,
      pagination,
    });

    const serializationOptions = this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .policy.getSerializationOptions({ clinicId });

    return {
      data: result.items.map((item) => item.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
        serializationOptions,
      },
    };
  }
}
