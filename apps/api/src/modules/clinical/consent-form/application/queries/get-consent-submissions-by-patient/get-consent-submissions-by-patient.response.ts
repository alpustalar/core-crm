import { QueryResponse } from '@shared/common/response/response.interface';
import { ConsentFormSubmissionListItem } from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';

export type GetConsentSubmissionsByPatientResponse = QueryResponse<
  ConsentFormSubmissionListItem[]
>;
