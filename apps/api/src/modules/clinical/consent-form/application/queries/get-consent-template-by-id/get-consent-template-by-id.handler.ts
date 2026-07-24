import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConsentTemplateByIdQuery } from './get-consent-template-by-id.query';
import { GetConsentTemplateByIdResponse } from './get-consent-template-by-id.response';
import {
  CONSENT_TEMPLATE_QUERY_REPOSITORY,
  IConsentTemplateQueryRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CONSENT_TEMPLATE_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import { ConsentTemplateNotFoundException } from '@modules/clinical/consent-form/domain/exceptions/consent-form.exceptions';

@QueryHandler(GetConsentTemplateByIdQuery)
export class GetConsentTemplateByIdHandler implements IQueryHandler<
  GetConsentTemplateByIdQuery,
  GetConsentTemplateByIdResponse
> {
  constructor(
    @Inject(CONSENT_TEMPLATE_QUERY_REPOSITORY)
    private readonly templateQueryRepo: IConsentTemplateQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetConsentTemplateByIdQuery
  ): Promise<GetConsentTemplateByIdResponse> {
    const { templateId, ctx } = query;

    const template = await this.templateQueryRepo.findById(templateId);
    if (!template) throw new ConsentTemplateNotFoundException(templateId);

    this.policyFactory
      .consentForm(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.canAccessConsentTemplates(template.clinicId.value)
      )
      .orThrow(CONSENT_TEMPLATE_EVENTS.GET);

    return { data: template.toPersistence() };
  }
}
