import { QueryResponse } from '@shared/common/response/response.interface';
import { ConsentFormTemplate } from '@shared';

export type GetConsentTemplateByIdResponse =
  QueryResponse<ConsentFormTemplate | null>;
