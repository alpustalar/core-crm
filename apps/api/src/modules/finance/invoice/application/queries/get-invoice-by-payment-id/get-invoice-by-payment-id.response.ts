import { QueryResponse } from '@shared/common/response/response.interface';
import { InvoiceView } from '@modules/finance/invoice/domain/invoice.contracts';

export type GetInvoiceByPaymentIdResponse = QueryResponse<InvoiceView | null>;
