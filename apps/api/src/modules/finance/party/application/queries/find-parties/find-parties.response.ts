import { QueryResponse } from '@shared/common/response/response.interface';
import { Party } from '@shared';

export type FindPartiesResponse = QueryResponse<Party[]>;
