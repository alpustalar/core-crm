import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetHotelBookingsQuery } from './get-hotel-bookings.query';
import { GetHotelBookingsResponse } from './get-hotel-bookings.response';

import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import {
  HOTELBEDS_BOOKING_QUERY_REPOSITORY,
  IHotelbedsBookingQueryRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking/hotelbeds-booking.query.repository';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { GetClinicOrganizationIdQuery } from '@modules/organization/clinic/application/queries/get-clinic-organization-id/get-clinic-organization-id.query';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetHotelBookingsQuery)
export class GetHotelBookingsHandler
  implements IQueryHandler<GetHotelBookingsQuery, GetHotelBookingsResponse>
{
  constructor(
    @Inject(HOTELBEDS_BOOKING_QUERY_REPOSITORY)
    private readonly hotelbedsBookingRepo: IHotelbedsBookingQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory,
    private readonly queryBus: TSQueryBus
  ) {}

  async execute(
    query: GetHotelBookingsQuery
  ): Promise<GetHotelBookingsResponse> {
    const { filter, ctx } = query;

    const { data: organizationId } = await this.queryBus.execute(
      new GetClinicOrganizationIdQuery(filter.clinicId)
    );

    const { total, items: hotelBookings } =
      await this.hotelbedsBookingRepo.findMany(
        {
          organizationId,
          patientId: filter.patientId,
          leadId: filter.leadId,
        },
        filter.pagination
      );

    const serializationOptions = this.policyFactory
      .clinic(ctx.actor, ctx.source)
      .policy.getSerializationOptions();

    return {
      data: hotelBookings,
      meta: {
        pagination: buildPaginationMeta(filter.pagination, total),
        serializationOptions,
      },
    };
  }
}
