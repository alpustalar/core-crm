import { QueryResponse } from '@shared/common/response/response.interface';
import { HotelbedsBooking } from '@shared';

export type GetHotelBookingsResponse = QueryResponse<HotelbedsBooking[]>;
