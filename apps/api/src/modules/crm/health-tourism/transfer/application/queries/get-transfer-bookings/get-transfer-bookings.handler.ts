import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTransferBookingsQuery } from './get-transfer-bookings.query';
import { GetTransferBookingsResponse } from './get-transfer-bookings.response';
import {
  HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY,
  IHotelbedsTransferBookingQueryRepository,
} from '@modules/crm/health-tourism/transfer/domain/repositories/hotelbeds-transfer-booking.repository.interface';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';

@QueryHandler(GetTransferBookingsQuery)
export class GetTransferBookingsHandler
  implements
    IQueryHandler<GetTransferBookingsQuery, GetTransferBookingsResponse>
{
  constructor(
    @Inject(HOTELBEDS_TRANSFER_BOOKING_QUERY_REPOSITORY)
    private readonly bookingQueryRepo: IHotelbedsTransferBookingQueryRepository
  ) {}

  async execute(
    query: GetTransferBookingsQuery
  ): Promise<GetTransferBookingsResponse> {
    const { dto, ctx } = query;
    const { actor } = ctx;

    const { items: transferBooking, total } =
      await this.bookingQueryRepo.findMany(
        {
          organizationId: actor.organizationId!,
          clinicId: dto.clinicId,
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
      data: transferBooking.map((t) => t.toPersistence()),
      meta: {
        pagination: buildPaginationMeta(dto.pagination, total),
      },
    };
  }
}
