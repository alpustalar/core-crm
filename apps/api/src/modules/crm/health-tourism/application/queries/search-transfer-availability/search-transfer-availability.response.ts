import { TransferAvailabilityItem } from '@modules/crm/health-tourism/domain/types/transfer-availability.type';

export interface SearchTransferAvailabilityResponse {
  data: TransferAvailabilityItem[];
  fromCache: boolean;
}
