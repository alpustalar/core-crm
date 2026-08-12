import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetTransferBookingsResponse } from './get-transfer-bookings.response';
import { GetTransferBookings } from '@shared/modules/health-tourism';

export class GetTransferBookingsQuery implements IQuery {
  readonly __responseType!: GetTransferBookingsResponse;

  constructor(
    public readonly filter: GetTransferBookings,
    public readonly ctx: IGetContext
  ) {}
}
