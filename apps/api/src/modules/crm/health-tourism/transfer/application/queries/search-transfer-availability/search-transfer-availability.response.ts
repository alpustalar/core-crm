import { TransferAvailabilityItem } from '@modules/crm/health-tourism/transfer/domain/contracts/transfer.contracts';
import { QueryResponse } from '@shared/common/response/response.interface';

export type SearchTransferAvailabilityResponse = QueryResponse<
  TransferAvailabilityItem[]
> & {
  meta: {
    fromCache: boolean;
  };
};
