import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTransferBookingByIdQuery } from './get-transfer-booking-by-id.query';
import { GetTransferBookingByIdResponse } from './get-transfer-booking-by-id.response';
import {
  HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
  IHotelbedsTransferBookingQueryRepository,
} from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { HotelbedsTransferNotFound } from '@modules/crm/health-tourism/transfer/domain/exceptions/hotelbeds-transfer.exceptions';

@QueryHandler(GetTransferBookingByIdQuery)
export class GetTransferBookingByIdHandler
  implements
    IQueryHandler<GetTransferBookingByIdQuery, GetTransferBookingByIdResponse>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY)
    private readonly bookingQueryRepo: IHotelbedsTransferBookingQueryRepository
  ) {}

  async execute(
    query: GetTransferBookingByIdQuery
  ): Promise<GetTransferBookingByIdResponse> {
    const result = await this.bookingQueryRepo.findById(query.id);
    if (!result) throw new HotelbedsTransferNotFound();
    return {
      data: result.toPersistence(),
    };
  }
}
