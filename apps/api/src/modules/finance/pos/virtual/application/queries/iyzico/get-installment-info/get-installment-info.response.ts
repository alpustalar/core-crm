import { QueryResponse } from '@shared';
import { InstallmentOption } from '@modules/finance/payment/domain/contracts/payment.contracts';

export type GetInstallmentInfoQueryResponse = QueryResponse<{
  options: InstallmentOption[];
}>;
