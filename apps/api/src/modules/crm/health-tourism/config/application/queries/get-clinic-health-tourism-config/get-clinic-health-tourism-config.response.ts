import { QueryResponse } from '@shared/common/response/response.interface';
import { HealthTourismConfigResponse } from '@shared/modules/health-tourism/interfaces';

/** Config yoksa data null döner. Gizli alan yok (AI runtime de bu sorguyu kullanır). */
export type GetClinicHealthTourismConfigResponse =
  QueryResponse<HealthTourismConfigResponse | null>;
