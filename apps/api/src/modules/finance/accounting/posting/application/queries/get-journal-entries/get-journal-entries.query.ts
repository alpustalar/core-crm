import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetJournalEntriesResponse } from './get-journal-entries.response';
import { JournalEntryStatusType } from '@input-type-schemas/JournalEntryStatusSchema';
import { Pagination } from '@shared';

export class GetJournalEntriesQuery implements IQuery {
  readonly __responseType!: GetJournalEntriesResponse;
  constructor(
    public readonly payload: {
      organizationId: string;
      pagination: Pagination;
      ctx: IGetContext;
      status?: JournalEntryStatusType;
      periodId?: string;
    }
  ) {}
}
