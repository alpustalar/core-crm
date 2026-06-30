import { QueryResponse } from '@shared/common/response/response.interface';
import { Patient } from '@shared';

export type FindPatientByContactResponse = QueryResponse<Patient | null>;
