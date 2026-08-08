import {
  ConsentFormSubmissionListItem,
  FindConsentSubmissionsByPatientFilter,
} from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';
import { Paginated } from '@common/interfaces/paginated.type';
import { ConsentFormSubmission } from '@shared';

export const CONSENT_FORM_SUBMISSION_QUERY_REPOSITORY = Symbol(
  'IConsentFormSubmissionQueryRepository'
);

export interface IConsentFormSubmissionQueryRepository {
  findById(id: string): Promise<ConsentFormSubmission | null>;
  findByPatient(
    filter: FindConsentSubmissionsByPatientFilter
  ): Promise<Paginated<ConsentFormSubmissionListItem>>;
}
