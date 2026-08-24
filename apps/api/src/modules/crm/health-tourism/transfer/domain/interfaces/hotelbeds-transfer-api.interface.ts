import {
  CancelTransferBookingResult,
  CreateTransferBookingData,
  TransferAvailabilityFilter,
  TransferAvailabilityItem,
  TransferBookingResult,
} from '@modules/crm/health-tourism/transfer/domain/contracts/hotelbeds-transfer-booking';

export const HOTELBEDS_TRANSFER_API_SERVICE = Symbol(
  'IHotelbedsTransferApiService'
);

export interface IHotelbedsTransferApiService {
  searchAvailability(
    filter: TransferAvailabilityFilter
  ): Promise<TransferAvailabilityItem[]>;
  createBooking(
    data: CreateTransferBookingData
  ): Promise<TransferBookingResult>;
  getBooking(
    language: string,
    reference: string
  ): Promise<TransferBookingResult>;
  cancelBooking(
    language: string,
    reference: string
  ): Promise<CancelTransferBookingResult>;
}
