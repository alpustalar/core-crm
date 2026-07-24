import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetPurchaseRequestByIdResponse } from './get-purchase-request-by-id.response';

export class GetPurchaseRequestByIdQuery implements IQuery {
  readonly __responseType!: GetPurchaseRequestByIdResponse;
  constructor(
    public readonly requestId: string,
    public readonly ctx: IGetContext
  ) {}
}
