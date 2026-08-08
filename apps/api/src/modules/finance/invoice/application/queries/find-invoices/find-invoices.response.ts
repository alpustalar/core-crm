import { QueryResponse } from '@shared/common/response/response.interface';
import { InvoiceListItem } from '@modules/finance/invoice/domain/contracts/invoice.contracts';

export type FindInvoicesResponse = QueryResponse<InvoiceListItem[]>;
