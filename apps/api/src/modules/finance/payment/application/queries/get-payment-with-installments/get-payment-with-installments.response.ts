import { QueryResponse } from '@shared/common/response/response.interface';
import { PaymentWithInstallment } from '@shared/modules/payment/interfaces/payment-with-installments.interface';

export type GetPaymentWithInstallmentsResponse =
  QueryResponse<PaymentWithInstallment | null>;
