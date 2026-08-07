import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  IJournalQueryRepository,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { GetJournalEntriesQuery } from './get-journal-entries.query';
import { GetJournalEntriesResponse } from './get-journal-entries.response';

@QueryHandler(GetJournalEntriesQuery)
export class GetJournalEntriesHandler
  implements IQueryHandler<GetJournalEntriesQuery, GetJournalEntriesResponse>
{
  constructor(
    @Inject(JOURNAL_QUERY_REPOSITORY)
    private readonly journalQueryRepo: IJournalQueryRepository
  ) {}

  async execute(
    query: GetJournalEntriesQuery
  ): Promise<GetJournalEntriesResponse> {
    const { organizationId, pagination, status, periodId } = query.payload;

    const { items, total } = await this.journalQueryRepo.findMany(
      { organizationId, status, periodId },
      pagination
    );

    return {
      data: items,
      meta: { pagination: buildPaginationMeta(pagination, total) },
    };
  }
}
