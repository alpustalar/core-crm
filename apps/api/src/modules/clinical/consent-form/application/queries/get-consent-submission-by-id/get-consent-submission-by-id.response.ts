import { QueryResponse } from '@shared/common/response/response.interface';
import { ConsentFormSubmission } from '@shared';

export type GetConsentSubmissionByIdResponse =
  QueryResponse<ConsentFormSubmission | null>;
