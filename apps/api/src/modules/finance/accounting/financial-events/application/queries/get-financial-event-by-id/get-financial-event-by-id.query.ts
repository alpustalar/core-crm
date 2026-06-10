import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetFinancialEventByIdResponse } from './get-financial-event-by-id.response';

export class GetFinancialEventByIdQuery implements IQuery {
  readonly __responseType!: GetFinancialEventByIdResponse;
  constructor(
    public readonly financialEventId: string,
    public readonly ctx: IGetContext
  ) {}
}
