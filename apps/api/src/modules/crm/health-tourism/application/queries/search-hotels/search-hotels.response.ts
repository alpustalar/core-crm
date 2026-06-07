import { HotelAvailabilityItem } from '@modules/crm/health-tourism/domain/types/hotel-availability.type';
import { QueryResponse } from '@shared/common/response/response.interface';

export type SearchHotelsResponse = QueryResponse<HotelAvailabilityItem[]>;
