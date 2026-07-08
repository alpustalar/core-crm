import { Pagination } from '@shared';
import { HotelbedsBooking } from '../entities/hotelbeds-booking.entity';
import { FindHotelBookingsFilter } from '@modules/crm/health-tourism/hotel/domain/hotel.contracts';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const HOTELBEDS_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsBookingCommandRepository'
);
export const HOTELBEDS_BOOKING_QUERY_REPOSITORY = Symbol(
  'IHotelbedsBookingQueryRepository'
);

export type IHotelbedsBookingCommandRepository =
  IBaseCommandRepository<HotelbedsBooking>;

export interface IHotelbedsBookingQueryRepository {
  findById(id: string): Promise<HotelbedsBooking | null>;
  findMany(
    filter: FindHotelBookingsFilter,
    pagination: Pagination
  ): Promise<{ items: HotelbedsBooking[]; total: number }>;
}
