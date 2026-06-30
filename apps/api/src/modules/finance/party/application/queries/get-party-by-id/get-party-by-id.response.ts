import { QueryResponse } from '@shared/common/response/response.interface';
import { Party } from '@shared';

export type GetPartyByIdResponse = QueryResponse<Party | null>;
