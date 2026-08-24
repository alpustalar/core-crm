import { HotelbedsTransferBooking, Pagination } from '@shared';
import { FindTransferBookingsFilter } from '@modules/crm/health-tourism/transfer/domain/contracts/hotelbeds-transfer-booking';

export const HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY = Symbol(
  'IHotelbedsTransferBookingQueryRepository'
);

export interface IHotelbedsTransferBookingQueryRepository {
  findById(id: string): Promise<HotelbedsTransferBooking | null>;
  findByReference(reference: string): Promise<HotelbedsTransferBooking | null>;
  findMany(
    filter: FindTransferBookingsFilter,
    pagination: Pagination
  ): Promise<{ items: HotelbedsTransferBooking[]; total: number }>;
}
