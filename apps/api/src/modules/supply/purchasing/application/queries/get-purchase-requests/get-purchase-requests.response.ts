import { QueryResponse } from '@shared/common/response/response.interface';
import { PurchaseRequestWithItems } from '@modules/supply/purchasing/domain/contracts/purchasing.contracts';

export type GetPurchaseRequestsResponse = QueryResponse<
  PurchaseRequestWithItems[]
>;
