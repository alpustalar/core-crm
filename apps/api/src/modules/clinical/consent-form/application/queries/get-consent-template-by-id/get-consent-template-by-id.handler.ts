import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConsentTemplateByIdQuery } from './get-consent-template-by-id.query';
import { GetConsentTemplateByIdResponse } from './get-consent-template-by-id.response';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { ConsentTemplateNotFoundException } from '@modules/clinical/consent-form/domain/exceptions/consent-form.exceptions';
import {
  CONSENT_TEMPLATE_QUERY_REPOSITORY,
  IConsentTemplateQueryRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-template/consent-template.query.repository';

@QueryHandler(GetConsentTemplateByIdQuery)
export class GetConsentTemplateByIdHandler
  implements
    IQueryHandler<GetConsentTemplateByIdQuery, GetConsentTemplateByIdResponse>
{
  constructor(
    @Inject(CONSENT_TEMPLATE_QUERY_REPOSITORY)
    private readonly consentTemplateRepo: IConsentTemplateQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetConsentTemplateByIdQuery
  ): Promise<GetConsentTemplateByIdResponse> {
    const { templateId, ctx } = query;

    const template = await this.consentTemplateRepo.findById(templateId);
    if (!template) throw new ConsentTemplateNotFoundException(templateId);

    const { policy } = this.policyFactory.consentForm(ctx.actor, ctx.source);

    return {
      data: template,
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: template.clinicId,
        }),
      },
    };
  }
}
