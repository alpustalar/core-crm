import { QueryResponse } from '@shared/common/response/response.interface';
import { MetaLeadResponse } from '@shared/modules/meta-ads/interfaces';

export type GetMetaLeadsResponse = QueryResponse<MetaLeadResponse[]>;
