import { QueryResponse } from '@shared/common/response/response.interface';
import { PurchaseOrderMatchSummary } from '@modules/supply/purchasing/domain/rules/purchase-order-billing.rules';

export type GetPurchaseOrderMatchSummaryResponse =
  QueryResponse<PurchaseOrderMatchSummary | null>;
