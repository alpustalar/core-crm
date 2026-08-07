import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetHotelBookingsResponse } from './get-hotel-bookings.response';
import { GetHotelBookings } from '@shared/modules/health-tourism';

export class GetHotelBookingsQuery implements IQuery {
  readonly __responseType!: GetHotelBookingsResponse;

  constructor(
    public readonly filter: GetHotelBookings,
    public readonly ctx: IGetContext
  ) {}
}
