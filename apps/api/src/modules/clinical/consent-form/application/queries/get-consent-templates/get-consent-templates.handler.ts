import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConsentTemplatesQuery } from './get-consent-templates.query';
import { GetConsentTemplatesResponse } from './get-consent-templates.response';
import {
  CONSENT_TEMPLATE_QUERY_REPOSITORY,
  IConsentTemplateQueryRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CONSENT_TEMPLATE_EVENTS } from '@src/domain/constants/events/consent-form.constant';

@QueryHandler(GetConsentTemplatesQuery)
export class GetConsentTemplatesHandler implements IQueryHandler<
  GetConsentTemplatesQuery,
  GetConsentTemplatesResponse
> {
  constructor(
    @Inject(CONSENT_TEMPLATE_QUERY_REPOSITORY)
    private readonly templateQueryRepo: IConsentTemplateQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetConsentTemplatesQuery
  ): Promise<GetConsentTemplatesResponse> {
    const { filter, pagination, ctx } = query.payload;

    this.policyFactory
      .consentForm(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessConsentTemplates(filter.clinicId))
      .orThrow(CONSENT_TEMPLATE_EVENTS.LIST);

    const result = await this.templateQueryRepo.findMany({
      clinicId: filter.clinicId,
      isActive: filter.isActive,
      sectorId: filter.sectorId,
      pagination,
    });

    return {
      data: result.items.map((item) => item.toPersistence()),
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
