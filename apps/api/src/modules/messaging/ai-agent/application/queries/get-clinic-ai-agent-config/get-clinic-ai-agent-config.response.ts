import { QueryResponse } from '@shared/common/response/response.interface';
import { AiAgentConfigResponse } from '@shared/modules/messaging/interfaces';

/** Config yoksa data null döner (anahtar maskeli). */
export type GetClinicAiAgentConfigResponse =
  QueryResponse<AiAgentConfigResponse | null>;
