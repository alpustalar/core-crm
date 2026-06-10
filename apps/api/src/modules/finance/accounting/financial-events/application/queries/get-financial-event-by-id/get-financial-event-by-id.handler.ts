import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  FINANCIAL_EVENT_QUERY_REPOSITORY,
  IFinancialEventQueryRepository,
} from '@modules/finance/accounting/financial-events/domain/repositories/financial-event.repository';
import { GetFinancialEventByIdQuery } from './get-financial-event-by-id.query';
import { GetFinancialEventByIdResponse } from './get-financial-event-by-id.response';

@QueryHandler(GetFinancialEventByIdQuery)
export class GetFinancialEventByIdHandler
  implements
    IQueryHandler<GetFinancialEventByIdQuery, GetFinancialEventByIdResponse>
{
  constructor(
    @Inject(FINANCIAL_EVENT_QUERY_REPOSITORY)
    private readonly eventQueryRepo: IFinancialEventQueryRepository
  ) {}

  async execute(
    query: GetFinancialEventByIdQuery
  ): Promise<GetFinancialEventByIdResponse> {
    const event = await this.eventQueryRepo.findById(query.financialEventId);
    return { data: event };
  }
}
