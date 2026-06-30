import { Patient, QueryResponse } from '@shared';

export type FindPatientByIdQueryResponse = QueryResponse<Patient | null>;
