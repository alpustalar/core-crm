import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetHotelBookingsQuery } from './get-hotel-bookings.query';
import { GetHotelBookingsResponse } from './get-hotel-bookings.response';
import {
  HOTELBEDS_BOOKING_QUERY_REPOSITORY,
  IHotelbedsBookingQueryRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking.repository.interface';

@QueryHandler(GetHotelBookingsQuery)
export class GetHotelBookingsHandler
  implements IQueryHandler<GetHotelBookingsQuery, GetHotelBookingsResponse>
{
  constructor(
    @Inject(HOTELBEDS_BOOKING_QUERY_REPOSITORY)
    private readonly bookingQueryRepo: IHotelbedsBookingQueryRepository
  ) {}

  async execute(
    query: GetHotelBookingsQuery
  ): Promise<GetHotelBookingsResponse> {
    const { dto, ctx } = query;
    const { actor } = ctx;

    const result = await this.bookingQueryRepo.findMany(
      {
        organizationId: actor.organizationId!,
        patientId: dto.patientId,
        leadId: dto.leadId,
      },
      {
        limit: dto.limit,
        page: dto.page,
        take: dto.limit,
        skip: (dto.page - 1) * dto.limit,
        orderBy: 'desc',
        orderByColumn: 'createdAt',
        searchOperator: 'AND',
      }
    );

    return { data: result };
  }
}
