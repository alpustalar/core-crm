import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { GetWorkOrderSummaryResponse } from './get-work-order-summary.response';

export class GetWorkOrderSummaryQuery implements IQuery {
  readonly __responseType!: GetWorkOrderSummaryResponse;
  constructor(public readonly ctx: IGetContext) {}
}
