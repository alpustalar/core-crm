import { QueryResponse } from '@shared';
import { InstallmentOption } from '@modules/finance/payment/domain/types/installment-option.type';

export type GetInstallmentInfoQueryResponse = QueryResponse<{
  options: InstallmentOption[];
}>;
