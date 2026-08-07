import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FindPeriodByDateQuery } from './find-period-by-date.query';
import { FindPeriodByDateResponse } from './find-period-by-date.response';
import {
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.query.repository';

@QueryHandler(FindPeriodByDateQuery)
export class FindPeriodByDateHandler
  implements IQueryHandler<FindPeriodByDateQuery, FindPeriodByDateResponse>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_QUERY_REPOSITORY)
    private readonly accountingPeriodRepo: IAccountingPeriodQueryRepository
  ) {}

  async execute(
    query: FindPeriodByDateQuery
  ): Promise<FindPeriodByDateResponse> {
    const period = await this.accountingPeriodRepo.findByDate(
      query.clinicId,
      query.date
    );
    return { data: period };
  }
}
