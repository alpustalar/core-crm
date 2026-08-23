import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetHotelBookingByIdResponse } from './get-hotel-booking-by-id.response';

export class GetHotelBookingByIdQuery implements IQuery {
  readonly __responseType!: GetHotelBookingByIdResponse;

  constructor(
    public readonly bookingId: string,
    public readonly ctx: IGetContext
  ) {}
}
