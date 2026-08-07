import { IBaseCommandRepository } from '@common/domain/repositories/base-command-repository.interface';
import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/transfer/domain/entities/hotelbeds-transfer-booking.entity';

export const HOTELBEDS_TRANSFER_BOOKING_COMMAND_REPOSITORY = Symbol(
  'IHotelbedsTransferBookingCommandRepository'
);
export interface IHotelbedsTransferBookingCommandRepository
  extends IBaseCommandRepository<HotelbedsTransferBooking> {
  findByReference(reference: string): Promise<HotelbedsTransferBooking | null>;
}
