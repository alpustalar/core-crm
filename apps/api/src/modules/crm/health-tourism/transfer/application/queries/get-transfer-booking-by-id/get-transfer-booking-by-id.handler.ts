import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTransferBookingByIdQuery } from './get-transfer-booking-by-id.query';
import { GetTransferBookingByIdResponse } from './get-transfer-booking-by-id.response';
import {
  HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
  IHotelbedsTransferBookingQueryRepository,
} from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking.repository.interface';

@QueryHandler(GetTransferBookingByIdQuery)
export class GetTransferBookingByIdHandler
  implements
    IQueryHandler<
      GetTransferBookingByIdQuery,
      GetTransferBookingByIdResponse
    >
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY)
    private readonly bookingQueryRepo: IHotelbedsTransferBookingQueryRepository,
  ) {}

  async execute(
    query: GetTransferBookingByIdQuery,
  ): Promise<GetTransferBookingByIdResponse> {
    return this.bookingQueryRepo.findById(query.id);
  }
}
