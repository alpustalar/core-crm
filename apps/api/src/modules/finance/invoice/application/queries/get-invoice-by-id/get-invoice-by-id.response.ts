import { QueryResponse } from '@shared/common/response/response.interface';
import { InvoiceView } from '@modules/finance/invoice/domain/invoice.contracts';

export type GetInvoiceByIdResponse = QueryResponse<InvoiceView | null>;
