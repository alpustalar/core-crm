import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAccountingPeriodsQuery } from './get-accounting-periods.query';
import { GetAccountingPeriodsResponse } from './get-accounting-periods.response';
import {
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.query.repository';

@QueryHandler(GetAccountingPeriodsQuery)
export class GetAccountingPeriodsHandler
  implements
    IQueryHandler<GetAccountingPeriodsQuery, GetAccountingPeriodsResponse>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_QUERY_REPOSITORY)
    private readonly accountingPeriodRepo: IAccountingPeriodQueryRepository
  ) {}

  async execute(
    query: GetAccountingPeriodsQuery
  ): Promise<GetAccountingPeriodsResponse> {
    const periods = await this.accountingPeriodRepo.findAllByClinicId(
      query.clinicId
    );

    return { data: periods };
  }
}
