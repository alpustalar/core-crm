import { Pagination } from '@shared';
import { HotelbedsBooking } from '../entities/hotelbeds-booking.entity';
import {
  CreateHotelbedsBookingData,
  FindHotelBookingsFilter,
} from '@modules/crm/health-tourism/hotel/domain/hotel.contracts';

export const HOTELBEDS_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsBookingCommandRepository'
);
export const HOTELBEDS_BOOKING_QUERY_REPOSITORY = Symbol(
  'IHotelbedsBookingQueryRepository'
);

export interface IHotelbedsBookingCommandRepository {
  create(props: CreateHotelbedsBookingData): Promise<HotelbedsBooking>;
  save(booking: HotelbedsBooking): Promise<HotelbedsBooking>;
}

export interface IHotelbedsBookingQueryRepository {
  findById(id: string): Promise<HotelbedsBooking | null>;
  findMany(
    filter: FindHotelBookingsFilter,
    pagination: Pagination
  ): Promise<{ items: HotelbedsBooking[]; total: number }>;
}
