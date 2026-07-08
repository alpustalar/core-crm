import { QueryResponse } from '@shared/common/response/response.interface';
import { PurchaseInvoice } from '@shared';

export type GetPurchaseInvoicesResponse = QueryResponse<PurchaseInvoice[]>;
