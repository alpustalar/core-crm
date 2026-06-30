import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetHotelBookingByIdQuery } from './get-hotel-booking-by-id.query';
import { GetHotelBookingByIdResponse } from './get-hotel-booking-by-id.response';
import {
  HOTELBEDS_BOOKING_QUERY_REPOSITORY,
  IHotelbedsBookingQueryRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking.repository.interface';
import { HotelbedsBookingNotFoundException } from '@modules/crm/health-tourism/hotel/domain/exceptions/hotelbeds-booking.exceptions';

@QueryHandler(GetHotelBookingByIdQuery)
export class GetHotelBookingByIdHandler
  implements
    IQueryHandler<GetHotelBookingByIdQuery, GetHotelBookingByIdResponse>
{
  constructor(
    @Inject(HOTELBEDS_BOOKING_QUERY_REPOSITORY)
    private readonly bookingQueryRepo: IHotelbedsBookingQueryRepository
  ) {}

  async execute(
    query: GetHotelBookingByIdQuery
  ): Promise<GetHotelBookingByIdResponse> {
    const booking = await this.bookingQueryRepo.findById(query.bookingId);

    if (!booking) throw new HotelbedsBookingNotFoundException();

    return { data: booking.toPersistence() };
  }
}
