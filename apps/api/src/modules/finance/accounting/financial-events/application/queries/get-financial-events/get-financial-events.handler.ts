import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  FINANCIAL_EVENT_QUERY_REPOSITORY,
  IFinancialEventQueryRepository,
} from '@modules/finance/accounting/financial-events/domain/repositories/financial-event.repository';
import { GetFinancialEventsQuery } from './get-financial-events.query';
import { GetFinancialEventsResponse } from './get-financial-events.response';

@QueryHandler(GetFinancialEventsQuery)
export class GetFinancialEventsHandler
  implements IQueryHandler<GetFinancialEventsQuery, GetFinancialEventsResponse>
{
  constructor(
    @Inject(FINANCIAL_EVENT_QUERY_REPOSITORY)
    private readonly eventQueryRepo: IFinancialEventQueryRepository
  ) {}

  async execute(
    query: GetFinancialEventsQuery
  ): Promise<GetFinancialEventsResponse> {
    const { organizationId, pagination, type, sourceModule, sourceRefId } =
      query;

    const { items, total } = await this.eventQueryRepo.findMany(
      { organizationId, type, sourceModule, sourceRefId },
      pagination
    );

    return {
      data: items,
      meta: { pagination: buildPaginationMeta(pagination, total) },
    };
  }
}
