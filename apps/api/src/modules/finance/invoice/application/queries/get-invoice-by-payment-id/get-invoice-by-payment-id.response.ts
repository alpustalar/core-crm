import { QueryResponse } from '@shared/common/response/response.interface';
import { InvoiceView } from '@modules/finance/invoice/domain/contracts/invoice';

export type GetInvoiceByPaymentIdResponse = QueryResponse<InvoiceView | null>;
