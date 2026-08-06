import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetWorkOrderByIdResponse } from './get-work-order-by-id.response';

export class GetWorkOrderByIdQuery implements IQuery {
  readonly __responseType!: GetWorkOrderByIdResponse;
  constructor(
    public readonly workOrderId: string,
    public readonly ctx: IGetContext
  ) {}
}
