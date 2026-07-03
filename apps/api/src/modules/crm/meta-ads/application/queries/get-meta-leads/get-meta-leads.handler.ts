import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetaLeadsQuery } from './get-meta-leads.query';
import { GetMetaLeadsResponse } from './get-meta-leads.response';
import {
  IMetaLeadQueryRepository,
  META_LEAD_QUERY_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetMetaLeadsQuery)
export class GetMetaLeadsHandler
  implements IQueryHandler<GetMetaLeadsQuery, GetMetaLeadsResponse>
{
  constructor(
    @Inject(META_LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: IMetaLeadQueryRepository
  ) {}

  async execute(query: GetMetaLeadsQuery): Promise<GetMetaLeadsResponse> {
    const result = await this.leadQueryRepo.findMany({
      clinicId: query.clinicId,
      status: query.status,
      pagination: query.pagination,
    });

    return {
      data: result.items.map((lead) => ({
        id: lead.id.value,
        metaLeadId: lead.metaLeadId,
        campaignId: lead.campaignId,
        campaignName: lead.campaignName,
        name: lead.name,
        phone: lead.phone?.value ?? null,
        email: lead.email?.value ?? null,
        status: lead.status,
        matchedPatientId: lead.matchedPatientId,
        matchedAppointmentId: lead.matchedAppointmentId?.value ?? null,
        matchedAt: lead.matchedAt,
        createdAt: lead.createdAt,
      })),
      meta: { pagination: buildPaginationMeta(query.pagination, result.total) },
    };
  }
}
