import { QueryResponse } from '@shared/common/response/response.interface';
import { MetaAdAccountResponse } from '@shared/modules/meta-ads/interfaces';

export type GetMetaAccountsResponse = QueryResponse<MetaAdAccountResponse[]>;
