import { QueryResponse } from '@shared/common/response/response.interface';
import { TransferRateOptionToken } from '@modules/crm/health-tourism/transfer/domain/contracts/transfer.contracts';

export type GetTransferRateOptionResponse =
  QueryResponse<TransferRateOptionToken | null>;
