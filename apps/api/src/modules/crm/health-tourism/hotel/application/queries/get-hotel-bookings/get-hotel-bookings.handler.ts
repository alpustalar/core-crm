import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetHotelBookingsQuery } from './get-hotel-bookings.query';
import { GetHotelBookingsResponse } from './get-hotel-bookings.response';
import {
  HOTELBEDS_BOOKING_QUERY_REPOSITORY,
  IHotelbedsBookingQueryRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { OrganizationNotAssignedException } from '@src/domain/exceptions/organization-not-assigned.exception';

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

    if (!actor.organizationId) throw new OrganizationNotAssignedException();

    const { total, items: hotelBookings } =
      await this.bookingQueryRepo.findMany(
        {
          organizationId: actor.organizationId,
          patientId: dto.patientId,
          leadId: dto.leadId,
        },
        {
          ...dto.pagination,
          orderBy: 'desc',
          orderByColumn: 'createdAt',
          searchOperator: 'AND',
        }
      );

    return {
      data: hotelBookings.map((booking) => booking.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(dto.pagination, total),
      },
    };
  }
}
