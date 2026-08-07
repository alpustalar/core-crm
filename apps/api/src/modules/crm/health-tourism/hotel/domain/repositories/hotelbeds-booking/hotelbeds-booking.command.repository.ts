import { HotelbedsBooking } from '../../entities/hotelbeds-booking.entity';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const HOTELBEDS_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsBookingCommandRepository'
);
export type IHotelbedsBookingCommandRepository =
  IBaseCommandRepository<HotelbedsBooking>;
