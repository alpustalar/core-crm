import { QueryResponse } from '@shared';
import { InstallmentOption } from '@modules/finance/payment/domain/contracts/payment';

export type GetInstallmentInfoQueryResponse = QueryResponse<{
  options: InstallmentOption[];
}>;
