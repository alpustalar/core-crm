import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  IAccountingPeriodQueryRepository,
} from '@modules/finance/accounting/periods/domain/repositories/accounting-period.repository';
import { GetAccountingPeriodsQuery } from './get-accounting-periods.query';
import { GetAccountingPeriodsResponse } from './get-accounting-periods.response';

@QueryHandler(GetAccountingPeriodsQuery)
export class GetAccountingPeriodsHandler
  implements
    IQueryHandler<GetAccountingPeriodsQuery, GetAccountingPeriodsResponse>
{
  constructor(
    @Inject(ACCOUNTING_PERIOD_QUERY_REPOSITORY)
    private readonly periodQueryRepo: IAccountingPeriodQueryRepository
  ) {}

  async execute(
    query: GetAccountingPeriodsQuery
  ): Promise<GetAccountingPeriodsResponse> {
    const periods = await this.periodQueryRepo.findAllByClinicId(
      query.clinicId
    );

    return { data: periods };
  }
}
