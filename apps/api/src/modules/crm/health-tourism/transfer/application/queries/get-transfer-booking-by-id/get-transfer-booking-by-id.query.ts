import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { GetTransferBookingByIdResponse } from './get-transfer-booking-by-id.response';

export class GetTransferBookingByIdQuery implements IQuery {
  readonly __responseType!: GetTransferBookingByIdResponse;

  constructor(
    public readonly id: string,
    public readonly ctx: IGetContext
  ) {}
}
