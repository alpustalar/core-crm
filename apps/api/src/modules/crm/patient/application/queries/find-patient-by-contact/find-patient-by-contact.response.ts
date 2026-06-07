import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';
import { QueryResponse } from '@shared/common/response/response.interface';

export type FindPatientByContactResponse = QueryResponse<Patient | null>;
