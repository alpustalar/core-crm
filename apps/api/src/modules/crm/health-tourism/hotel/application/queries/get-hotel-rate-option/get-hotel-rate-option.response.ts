import { QueryResponse } from '@shared/common/response/response.interface';
import { HotelRateOptionToken } from '@modules/crm/health-tourism/hotel/domain/contracts/hotel.contracts';

export type GetHotelRateOptionResponse =
  QueryResponse<HotelRateOptionToken | null>;
