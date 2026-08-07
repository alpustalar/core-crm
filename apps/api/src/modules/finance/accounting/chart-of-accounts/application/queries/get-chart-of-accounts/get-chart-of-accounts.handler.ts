import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetChartOfAccountsQuery } from './get-chart-of-accounts.query';
import { GetChartOfAccountsResponse } from './get-chart-of-accounts.response';
import {
  ACCOUNT_QUERY_REPOSITORY,
  IAccountQueryRepository,
} from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account/account.query.repository';

@QueryHandler(GetChartOfAccountsQuery)
export class GetChartOfAccountsHandler
  implements IQueryHandler<GetChartOfAccountsQuery, GetChartOfAccountsResponse>
{
  constructor(
    @Inject(ACCOUNT_QUERY_REPOSITORY)
    private readonly accountRepo: IAccountQueryRepository
  ) {}

  async execute(
    query: GetChartOfAccountsQuery
  ): Promise<GetChartOfAccountsResponse> {
    const accounts = await this.accountRepo.findAllByClinicId(query.clinicId);

    return { data: accounts };
  }
}
