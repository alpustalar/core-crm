import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCOUNT_QUERY_REPOSITORY,
  IAccountQueryRepository,
} from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account.repository';
import { GetChartOfAccountsQuery } from './get-chart-of-accounts.query';
import { GetChartOfAccountsResponse } from './get-chart-of-accounts.response';

@QueryHandler(GetChartOfAccountsQuery)
export class GetChartOfAccountsHandler
  implements IQueryHandler<GetChartOfAccountsQuery, GetChartOfAccountsResponse>
{
  constructor(
    @Inject(ACCOUNT_QUERY_REPOSITORY)
    private readonly accountQueryRepo: IAccountQueryRepository
  ) {}

  async execute(
    query: GetChartOfAccountsQuery
  ): Promise<GetChartOfAccountsResponse> {
    const accounts = await this.accountQueryRepo.findAllByClinicId(
      query.clinicId
    );

    return { data: accounts };
  }
}
