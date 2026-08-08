import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetFinancialEventByIdQuery } from './get-financial-event-by-id.query';
import { GetFinancialEventByIdResponse } from './get-financial-event-by-id.response';
import {
  FINANCIAL_EVENT_QUERY_REPOSITORY,
  IFinancialEventQueryRepository,
} from '@modules/finance/accounting/financial-events/domain/repositories/financial-event/financial-event.query.repository';

@QueryHandler(GetFinancialEventByIdQuery)
export class GetFinancialEventByIdHandler
  implements
    IQueryHandler<GetFinancialEventByIdQuery, GetFinancialEventByIdResponse>
{
  constructor(
    @Inject(FINANCIAL_EVENT_QUERY_REPOSITORY)
    private readonly financialEventRepo: IFinancialEventQueryRepository
  ) {}

  async execute(
    query: GetFinancialEventByIdQuery
  ): Promise<GetFinancialEventByIdResponse> {
    const event = await this.financialEventRepo.findById(
      query.financialEventId
    );
    return { data: event };
  }
}
