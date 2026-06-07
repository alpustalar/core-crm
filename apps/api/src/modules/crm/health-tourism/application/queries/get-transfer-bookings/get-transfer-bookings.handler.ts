import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTransferBookingsQuery } from './get-transfer-bookings.query';
import { GetTransferBookingsResponse } from './get-transfer-bookings.response';
import {
  HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
  IHotelbedsTransferBookingQueryRepository,
} from '@modules/crm/health-tourism/domain/repositories/hotelbeds-transfer-booking.repository.interface';

@QueryHandler(GetTransferBookingsQuery)
export class GetTransferBookingsHandler
  implements
    IQueryHandler<GetTransferBookingsQuery, GetTransferBookingsResponse>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY)
    private readonly bookingQueryRepo: IHotelbedsTransferBookingQueryRepository,
  ) {}

  async execute(
    query: GetTransferBookingsQuery,
  ): Promise<GetTransferBookingsResponse> {
    const { dto, ctx } = query;
    const { actor } = ctx;

    const result = await this.bookingQueryRepo.findMany(
      {
        organizationId: actor.organizationId!,
        clinicId: dto.clinicId,
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
      },
    );

    return { data: result };
  }
}
