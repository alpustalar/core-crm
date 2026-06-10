import { QueryResponse } from '@shared/common/response/response.interface';
import { Party } from '@modules/finance/party/domain/entities/party.entity';

export type GetPartyByIdResponse = QueryResponse<Party | null>;
