import { RegisteredPatient } from '@shared';
import { QueryResponse } from '@shared/common/response/response.interface';

export type FindPatientByFirebaseUidQueryResponse =
  QueryResponse<RegisteredPatient | null>;
