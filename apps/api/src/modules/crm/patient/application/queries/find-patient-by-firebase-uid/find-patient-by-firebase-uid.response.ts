import { QueryResponse } from '@shared/common/response/response.interface';
import { Patient } from '@modules/crm/patient/domain/entities/patient.entity';

export type FindPatientByFirebaseUidQueryResponse =
  QueryResponse<Patient | null>;
