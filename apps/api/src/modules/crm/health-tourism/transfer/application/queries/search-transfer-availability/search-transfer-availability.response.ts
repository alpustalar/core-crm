import { TransferAvailabilityItem } from '@modules/crm/health-tourism/transfer/domain/transfer.contracts';

export interface SearchTransferAvailabilityResponse {
  data: TransferAvailabilityItem[];
  fromCache: boolean;
}
