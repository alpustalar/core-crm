import { QueryResponse } from '@shared/common/response/response.interface';
import { TransferRateOptionToken } from '@modules/crm/health-tourism/transfer/domain/contracts/hotelbeds-transfer-booking';

export type GetTransferRateOptionResponse =
  QueryResponse<TransferRateOptionToken | null>;
