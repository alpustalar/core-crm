import { MetaLeadResponse } from '@shared/modules/meta-ads/interfaces';

export interface GetMetaLeadsResponse {
  items: MetaLeadResponse[];
  total: number;
}
