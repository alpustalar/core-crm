import { QueryResponse } from '@shared';
import { Patient } from '@modules/patient/domain/entities/patient.entity';

export type FindPatientByIdQueryResponse = QueryResponse<Patient | null>;
