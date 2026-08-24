import { QueryResponse } from '@shared/common/response/response.interface';
import { EffectiveCapability } from '@modules/identity/user/domain/contracts';

export type GetUserCapabilitiesResponse = QueryResponse<EffectiveCapability[]>;
