import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetaLeadsQuery } from './get-meta-leads.query';
import { GetMetaLeadsResponse } from './get-meta-leads.response';
import {
  IMetaLeadQueryRepository,
  META_LEAD_QUERY_REPOSITORY,
} from '@modules/crm/meta-ads/domain/repositories/meta-lead.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { META_ADS_EVENTS } from '@src/domain/constants/events';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetMetaLeadsQuery)
export class GetMetaLeadsHandler
  implements IQueryHandler<GetMetaLeadsQuery, GetMetaLeadsResponse>
{
  constructor(
    @Inject(META_LEAD_QUERY_REPOSITORY)
    private readonly metaLeadRepo: IMetaLeadQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(query: GetMetaLeadsQuery): Promise<GetMetaLeadsResponse> {
    const { evaluator, policy } = this.policyFactory.clinic(
      query.ctx.actor,
      query.ctx.source
    );

    evaluator
      .check(
        (p) => p.actorCanAccessTargetClinic(query.clinicId),
        'Bu kliniğin reklam adaylarına erişim yetkiniz yok.'
      )
      .orThrow(META_ADS_EVENTS.LEADS_LIST);

    const result = await this.metaLeadRepo.findMany({
      clinicId: query.clinicId,
      status: query.status,
      pagination: query.pagination,
    });

    return {
      data: result.items.map((lead) => ({
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
      meta: {
        pagination: buildPaginationMeta(query.pagination, result.total),
        serializationOptions: policy.getSerializationOptions({
          clinicId: query.clinicId,
        }),
      },
    };
  }
}
