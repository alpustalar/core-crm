import { IQuery } from '@nestjs/cqrs';
import { GetHotelBookingsDto } from '@shared/modules/health-tourism/dto/queries';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetHotelBookingsResponse } from './get-hotel-bookings.response';

export class GetHotelBookingsQuery implements IQuery {
  readonly __responseType!: GetHotelBookingsResponse;

  constructor(
    public readonly dto: GetHotelBookingsDto,
    public readonly ctx: IGetContext,
  ) {}
}
