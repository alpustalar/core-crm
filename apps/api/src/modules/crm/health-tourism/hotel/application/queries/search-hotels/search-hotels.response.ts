import { QueryResponse } from '@shared/common/response/response.interface';
import { HotelAvailabilityItem } from '@modules/crm/health-tourism/hotel/domain/hotel.contracts';

export type SearchHotelsResponse = QueryResponse<HotelAvailabilityItem[]>;
