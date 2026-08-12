import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetHotelBookingByIdQuery } from './get-hotel-booking-by-id.query';
import { GetHotelBookingByIdResponse } from './get-hotel-booking-by-id.response';

import { HotelbedsBookingNotFoundException } from '@modules/crm/health-tourism/hotel/domain/exceptions/hotelbeds-booking.exceptions';
import {
  HOTELBEDS_BOOKING_QUERY_REPOSITORY,
  IHotelbedsBookingQueryRepository,
} from '@modules/crm/health-tourism/hotel/domain/repositories/hotelbeds-booking/hotelbeds-booking.query.repository';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetHotelBookingByIdQuery)
export class GetHotelBookingByIdHandler
  implements
    IQueryHandler<GetHotelBookingByIdQuery, GetHotelBookingByIdResponse>
{
  constructor(
    @Inject(HOTELBEDS_BOOKING_QUERY_REPOSITORY)
    private readonly hotelbedsBookingRepo: IHotelbedsBookingQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
  ) {}

  async execute(
    query: GetHotelBookingByIdQuery
  ): Promise<GetHotelBookingByIdResponse> {
    const booking = await this.hotelbedsBookingRepo.findById(query.bookingId);

    if (!booking) throw new HotelbedsBookingNotFoundException();

    const { policy } = this.policyFactory.clinic(
      query.ctx.actor,
      query.ctx.source
    );

    return {
      data: booking,
      meta: {
        serializationOptions: policy.getSerializationOptions({
          clinicId: booking.clinicId,
        }),
      },
    };
  }
}
