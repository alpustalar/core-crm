import { QueryResponse } from '@shared/common/response/response.interface';
import { PurchaseOrderWithItems } from '@modules/supply/purchasing/domain/contracts/purchasing.contracts';

export type GetPurchaseOrderByIdResponse = QueryResponse<
  PurchaseOrderWithItems | null
>;
