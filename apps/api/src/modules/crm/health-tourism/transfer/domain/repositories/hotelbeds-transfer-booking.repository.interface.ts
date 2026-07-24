import { Pagination } from '@shared';
import { HotelbedsTransferBooking } from '../entities/hotelbeds-transfer-booking.entity';
import { FindTransferBookingsFilter } from '@modules/crm/health-tourism/transfer/domain/contracts/transfer.contracts';
import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';

export const HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsTransferBookingCommandRepository'
);
export const HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY = Symbol(
  'IHotelbedsTransferBookingQueryRepository'
);

export type IHotelbedsTransferBookingCommandRepository =
  IBaseCommandRepository<HotelbedsTransferBooking>;

export interface IHotelbedsTransferBookingQueryRepository {
  findById(id: string): Promise<HotelbedsTransferBooking | null>;
  findByReference(reference: string): Promise<HotelbedsTransferBooking | null>;
  findMany(
    filter: FindTransferBookingsFilter,
    pagination: Pagination
  ): Promise<{ items: HotelbedsTransferBooking[]; total: number }>;
}
