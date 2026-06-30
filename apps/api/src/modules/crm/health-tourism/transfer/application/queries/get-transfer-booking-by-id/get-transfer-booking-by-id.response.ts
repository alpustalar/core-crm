import { QueryResponse } from '@shared/common/response/response.interface';
import { HotelbedsTransferBooking } from '@shared';

export type GetTransferBookingByIdResponse =
  QueryResponse<HotelbedsTransferBooking>;
