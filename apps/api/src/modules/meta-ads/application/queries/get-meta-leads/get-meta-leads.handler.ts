import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetaLeadsQuery } from './get-meta-leads.query';
import { GetMetaLeadsResponse } from './get-meta-leads.response';
import {
  META_LEAD_QUERY_REPOSITORY,
  IMetaLeadQueryRepository,
} from '@modules/meta-ads/domain/repositories/meta-lead.repository.interface';

@QueryHandler(GetMetaLeadsQuery)
export class GetMetaLeadsHandler
  implements IQueryHandler<GetMetaLeadsQuery, GetMetaLeadsResponse>
{
  constructor(
    @Inject(META_LEAD_QUERY_REPOSITORY)
    private readonly leadQueryRepo: IMetaLeadQueryRepository,
  ) {}

  async execute(query: GetMetaLeadsQuery): Promise<GetMetaLeadsResponse> {
    const result = await this.leadQueryRepo.findMany({
      clinicId: query.clinicId,
      status: query.status,
      pagination: query.pagination,
    });

    return {
      items: result.items.map((lead) => ({
        id: lead.id,
        metaLeadId: lead.metaLeadId,
        campaignId: lead.campaignId,
        campaignName: lead.campaignName,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        matchedPatientId: lead.matchedPatientId,
        matchedAppointmentId: lead.matchedAppointmentId,
        matchedAt: lead.matchedAt,
        createdAt: lead.createdAt,
      })),
      total: result.total,
    };
  }
}
