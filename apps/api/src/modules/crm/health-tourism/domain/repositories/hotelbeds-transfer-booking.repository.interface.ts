import { Pagination } from '@shared';
import { HotelbedsTransferBooking } from '../entities/hotelbeds-transfer-booking.entity';
import { CreateTransferBookingProps } from '../types/create-transfer-booking.props';
import { FindTransferBookingsFilter } from '../types/find-transfer-bookings.type';

export const HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsTransferBookingCommandRepository',
);
export const HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY = Symbol(
  'IHotelbedsTransferBookingQueryRepository',
);

export interface IHotelbedsTransferBookingCommandRepository {
  create(props: CreateTransferBookingProps): Promise<HotelbedsTransferBooking>;
  save(
    booking: HotelbedsTransferBooking,
  ): Promise<HotelbedsTransferBooking>;
}

export interface IHotelbedsTransferBookingQueryRepository {
  findById(id: string): Promise<HotelbedsTransferBooking | null>;
  findByReference(
    reference: string,
  ): Promise<HotelbedsTransferBooking | null>;
  findMany(
    filter: FindTransferBookingsFilter,
    pagination: Pagination,
  ): Promise<{ items: HotelbedsTransferBooking[]; total: number }>;
}
