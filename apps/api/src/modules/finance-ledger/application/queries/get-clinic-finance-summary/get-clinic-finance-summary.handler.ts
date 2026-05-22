import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetClinicFinanceSummaryQuery } from './get-clinic-finance-summary.query';
import { GetClinicFinanceSummaryQueryResponse } from './get-clinic-finance-summary.response';

@QueryHandler(GetClinicFinanceSummaryQuery)
export class GetClinicFinanceSummaryHandler
  implements
    IQueryHandler<
      GetClinicFinanceSummaryQuery,
      GetClinicFinanceSummaryQueryResponse
    >
{
  constructor() {}

  async execute(
    query: GetClinicFinanceSummaryQuery
  ): Promise<GetClinicFinanceSummaryQueryResponse> {
    const { payload } = query;

    // TODO: tamamla
    return {};
  }
}
