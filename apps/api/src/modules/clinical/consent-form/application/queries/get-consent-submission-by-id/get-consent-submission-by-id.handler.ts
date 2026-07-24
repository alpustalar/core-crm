import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetConsentSubmissionByIdQuery } from './get-consent-submission-by-id.query';
import { GetConsentSubmissionByIdResponse } from './get-consent-submission-by-id.response';
import {
  CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY,
  IConsentFormSubmissionQueryRepository,
} from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';
import { CONSENT_FORM_EVENTS } from '@src/domain/constants/events/consent-form.constant';
import { ConsentFormSubmissionNotFoundException } from '@modules/clinical/consent-form/domain/exceptions/consent-form.exceptions';

@QueryHandler(GetConsentSubmissionByIdQuery)
export class GetConsentSubmissionByIdHandler implements IQueryHandler<
  GetConsentSubmissionByIdQuery,
  GetConsentSubmissionByIdResponse
> {
  constructor(
    @Inject(CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY)
    private readonly submissionQueryRepo: IConsentFormSubmissionQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetConsentSubmissionByIdQuery
  ): Promise<GetConsentSubmissionByIdResponse> {
    const { submissionId, ctx } = query;

    const submission = await this.submissionQueryRepo.findById(submissionId);
    if (!submission) {
      throw new ConsentFormSubmissionNotFoundException(submissionId);
    }

    this.policyFactory
      .consentForm(ctx.actor, ctx.source)
      .evaluator.check((p) =>
        p.canAccessConsentSubmissions(submission.clinicId.value)
      )
      .orThrow(CONSENT_FORM_EVENTS.GET);

    return { data: submission.toPersistence() };
  }
}
