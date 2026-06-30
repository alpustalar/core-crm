import { Payment } from '@shared';
import { QueryResponse } from '@shared/common/response/response.interface';

export type GetPaymentByAppointmentIdResponse = QueryResponse<Payment | null>;
