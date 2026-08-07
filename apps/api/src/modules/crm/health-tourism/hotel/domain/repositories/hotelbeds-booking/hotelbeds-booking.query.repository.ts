import { HotelbedsBooking, Pagination } from '@shared';
import { FindHotelBookingsFilter } from '@modules/crm/health-tourism/hotel/domain/contracts/hotel.contracts';

export const HOTELBEDS_BOOKING_QUERY_REPOSITORY = Symbol(
  'IHotelbedsBookingQueryRepository'
);

export interface IHotelbedsBookingQueryRepository {
  findById(id: string): Promise<HotelbedsBooking | null>;
  findMany(
    filter: FindHotelBookingsFilter,
    pagination: Pagination
  ): Promise<{ items: HotelbedsBooking[]; total: number }>;
}
