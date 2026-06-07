import { HotelbedsBooking } from '@modules/crm/health-tourism/hotel/domain/entities/hotelbeds-booking.entity';
import { QueryResponse } from '@shared/common/response/response.interface';

export type GetHotelBookingByIdResponse =
  QueryResponse<HotelbedsBooking | null>;
