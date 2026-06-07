import { Pagination } from '@shared';
import { HotelbedsBooking } from '../entities/hotelbeds-booking.entity';
import { CreateHotelbedsBookingProps } from '../types/create-hotelbeds-booking.props';
import { FindHotelBookingsFilter } from '../types/find-hotel-bookings.type';

export const HOTELBEDS_BOOKING_COMMAND_REPOSITORY = Symbol('IHotelbedsBookingCommandRepository');
export const HOTELBEDS_BOOKING_QUERY_REPOSITORY = Symbol('IHotelbedsBookingQueryRepository');

export interface IHotelbedsBookingCommandRepository {
  create(props: CreateHotelbedsBookingProps): Promise<HotelbedsBooking>;
  save(booking: HotelbedsBooking): Promise<HotelbedsBooking>;
}

export interface IHotelbedsBookingQueryRepository {
  findById(id: string): Promise<HotelbedsBooking | null>;
  findMany(
    filter: FindHotelBookingsFilter,
    pagination: Pagination,
  ): Promise<{ items: HotelbedsBooking[]; total: number }>;
}
