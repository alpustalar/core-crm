import { HotelbedsTransferBooking } from '@modules/crm/health-tourism/transfer/domain/entities/hotelbeds-transfer-booking.entity';

export interface GetTransferBookingsResponse {
  data: {
    items: HotelbedsTransferBooking[];
    total: number;
  };
}
