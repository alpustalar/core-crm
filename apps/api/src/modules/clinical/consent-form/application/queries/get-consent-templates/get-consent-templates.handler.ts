import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConsentTemplatesQuery } from './get-consent-templates.query';
import { GetConsentTemplatesResponse } from './get-consent-templates.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import {
  CONSENT_TEMPLATE_QUERY_REPOSITORY,
  IConsentTemplateQueryRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-template/consent-template.query.repository';

@QueryHandler(GetConsentTemplatesQuery)
export class GetConsentTemplatesHandler
  implements
    IQueryHandler<GetConsentTemplatesQuery, GetConsentTemplatesResponse>
{
  constructor(
    @Inject(CONSENT_TEMPLATE_QUERY_REPOSITORY)
    private readonly consentTemplateRepo: IConsentTemplateQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetConsentTemplatesQuery
  ): Promise<GetConsentTemplatesResponse> {
    const { filter, pagination, ctx } = query.payload;

    const { policy } = this.policyFactory.consentForm(ctx.actor, ctx.source);

    const result = await this.consentTemplateRepo.findMany({
      clinicId: filter.clinicId,
      isActive: filter.isActive,
      sectorId: filter.sectorId,
      pagination,
    });

    return {
      data: result.items,
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
        serializationOptions: policy.getSerializationOptions({
          clinicId: filter.clinicId,
        }),
      },
    };
  }
}
