import { Module } from '@nestjs/common';
import { GetJournalEntriesHandler } from './get-journal-entries/get-journal-entries.handler';
import { GetTrialBalanceHandler } from './get-trial-balance/get-trial-balance.handler';
import { JournalRepositoryModule } from '@modules/finance/accounting/posting/infrastructure/persistence/prisma/repositories/journal/journal.repository.module';

const QueryHandlers = [GetJournalEntriesHandler, GetTrialBalanceHandler];

@Module({
  imports: [JournalRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class PostingQueryModule {}
