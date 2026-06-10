import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetAccountingPeriodsResponse } from './get-accounting-periods.response';

export class GetAccountingPeriodsQuery implements IQuery {
  readonly __responseType!: GetAccountingPeriodsResponse;
  constructor(
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
