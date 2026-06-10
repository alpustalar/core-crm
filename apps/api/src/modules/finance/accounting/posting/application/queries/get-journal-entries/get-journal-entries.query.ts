import { IQuery } from '@nestjs/cqrs';
import { JournalEntryStatus } from '@prisma/client';
import { PaginationDto } from '@shared';
import { IGetContext } from '@common/decorators';
import { GetJournalEntriesResponse } from './get-journal-entries.response';

export class GetJournalEntriesQuery implements IQuery {
  readonly __responseType!: GetJournalEntriesResponse;
  constructor(
    public readonly organizationId: string,
    public readonly pagination: PaginationDto,
    public readonly ctx: IGetContext,
    public readonly status?: JournalEntryStatus,
    public readonly periodId?: string
  ) {}
}
