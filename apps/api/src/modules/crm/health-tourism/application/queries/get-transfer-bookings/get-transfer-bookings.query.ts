import { IQuery } from '@nestjs/cqrs';
import { GetTransferBookingsDto } from '@shared/modules/health-tourism/dto/queries';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetTransferBookingsResponse } from './get-transfer-bookings.response';

export class GetTransferBookingsQuery implements IQuery {
  readonly __responseType!: GetTransferBookingsResponse;

  constructor(
    public readonly dto: GetTransferBookingsDto,
    public readonly ctx: IGetContext,
  ) {}
}
