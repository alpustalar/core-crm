import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetChartOfAccountsResponse } from './get-chart-of-accounts.response';

export class GetChartOfAccountsQuery implements IQuery {
  readonly __responseType!: GetChartOfAccountsResponse;
  constructor(
    public readonly organizationId: string,
    public readonly ctx: IGetContext
  ) {}
}
