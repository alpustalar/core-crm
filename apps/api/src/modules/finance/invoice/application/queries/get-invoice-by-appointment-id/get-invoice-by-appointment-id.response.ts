import { QueryResponse } from '@shared/common/response/response.interface';
import { Invoice } from '@shared';

export type GetInvoiceByAppointmentIdResponse = QueryResponse<Invoice | null>;
