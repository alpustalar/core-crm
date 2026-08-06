import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConsentSubmissionsByPatientQuery } from './get-consent-submissions-by-patient.query';
import { GetConsentSubmissionsByPatientResponse } from './get-consent-submissions-by-patient.response';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CONSENT_FORM_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import {
  CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY,
  IConsentFormSubmissionQueryRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-form-submission/consent-form-submission.query.repository.interface';

@QueryHandler(GetConsentSubmissionsByPatientQuery)
export class GetConsentSubmissionsByPatientHandler
  implements
    IQueryHandler<
      GetConsentSubmissionsByPatientQuery,
      GetConsentSubmissionsByPatientResponse
    >
{
  constructor(
    @Inject(CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY)
    private readonly consentFormSubmissionRepo: IConsentFormSubmissionQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetConsentSubmissionsByPatientQuery
  ): Promise<GetConsentSubmissionsByPatientResponse> {
    const { patientId, pagination, ctx } = query.payload;

    this.policyFactory
      .consentForm(ctx.actor, ctx.source)
      .evaluator.check((p) => p.canAccessConsentSubmissions(ctx.actor.clinicId))
      .orThrow(CONSENT_FORM_EVENTS.LIST);

    const result = await this.consentFormSubmissionRepo.findByPatient({
      patientId,
      pagination,
    });

    return {
      data: result.items,
      meta: { pagination: buildPaginationMeta(pagination, result.total) },
    };
  }
}
