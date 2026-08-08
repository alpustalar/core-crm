import { QueryResponse } from '@shared/common/response/response.interface';
import { InvoiceView } from '@modules/finance/invoice/domain/contracts/invoice.contracts';

export type GetInvoiceByIdResponse = QueryResponse<InvoiceView | null>;
