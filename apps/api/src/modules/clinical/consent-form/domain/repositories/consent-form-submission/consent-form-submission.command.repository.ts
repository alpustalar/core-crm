import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { ConsentFormSubmission } from '@modules/clinical/consent-form/domain/entities/consent-form-submission.entity';

export const CONSENT_FORM_SUBMISSION_COMMAND_REPOSITORY = Symbol(
  'IConsentFormSubmissionCommandRepository'
);

export type IConsentFormSubmissionCommandRepository =
  IBaseCommandRepository<ConsentFormSubmission>;
