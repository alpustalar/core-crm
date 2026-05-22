import { QueryResponse } from '@shared/common/response/response.interface';
import { Patient } from '@modules/patient/domain/entities/patient.entity';

export type FindOrCreatePatientForAuthQueryResponse = QueryResponse<Patient>;
