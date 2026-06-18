import { IQuery } from '@nestjs/cqrs';
import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { GetJournalEntriesResponse } from './get-journal-entries.response';
import { JournalEntryStatusType } from '@input-type-schemas/JournalEntryStatusSchema';

export class GetJournalEntriesQuery implements IQuery {
  readonly __responseType!: GetJournalEntriesResponse;
  constructor(
    public readonly organizationId: string,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext,
    public readonly status?: JournalEntryStatusType,
    public readonly periodId?: string
  ) {}
}
