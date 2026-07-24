import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetPurchaseOrderByIdResponse } from './get-purchase-order-by-id.response';

export class GetPurchaseOrderByIdQuery implements IQuery {
  readonly __responseType!: GetPurchaseOrderByIdResponse;
  constructor(
    public readonly orderId: string,
    public readonly ctx: IGetContext
  ) {}
}
