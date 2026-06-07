import { QueryResponse } from '@shared';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';

export type FindPatientByIdQueryResponse = QueryResponse<Patient | null>;
