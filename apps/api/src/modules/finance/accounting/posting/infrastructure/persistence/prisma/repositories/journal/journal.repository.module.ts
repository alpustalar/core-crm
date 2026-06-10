import { Module } from '@nestjs/common';
import {
  JOURNAL_COMMAND_REPOSITORY,
  JOURNAL_QUERY_REPOSITORY,
} from '@modules/finance/accounting/posting/domain/repositories/journal.repository';
import { JournalCommandRepository } from './journal.command.repository';
import { JournalQueryRepository } from './journal.query.repository';

@Module({
  providers: [
    { provide: JOURNAL_COMMAND_REPOSITORY, useClass: JournalCommandRepository },
    { provide: JOURNAL_QUERY_REPOSITORY, useClass: JournalQueryRepository },
  ],
  exports: [JOURNAL_COMMAND_REPOSITORY, JOURNAL_QUERY_REPOSITORY],
})
export class JournalRepositoryModule {}
