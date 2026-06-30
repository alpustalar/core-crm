import { QueryResponse } from '@shared/common/response/response.interface';
import { Lead } from '@shared';

export type GetLeadsResponse = QueryResponse<Lead[]>;
