import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { FindPeriodByDateQuery } from './find-period-by-date.query';
import { FindPeriodByDateResponse } from './find-period-by-date.response';

@QueryHandler(FindPeriodByDateQuery)
export class FindPeriodByDateHandler
  implements IQueryHandler<FindPeriodByDateQuery, FindPeriodByDateResponse>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_QUERY_REPOSITORY)
    private readonly periodQueryRepo: IAccountingPeriodQueryRepository
  ) {}

  async execute(
    query: FindPeriodByDateQuery
  ): Promise<FindPeriodByDateResponse> {
    const period = await this.periodQueryRepo.findByDate(
      query.organizationId,
      query.date
    );
    return { data: period };
  }
}
