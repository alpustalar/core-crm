import { Module } from '@nestjs/common';
import { JournalController } from './controllers/journal.controller';
import { AccountingReportsController } from './controllers/accounting-reports.controller';
import { PostingQueryModule } from '@modules/finance/accounting/posting/application/queries/query.module';

@Module({
  imports: [PostingQueryModule],
  controllers: [JournalController, AccountingReportsController],
})
export class PostingPresentationModule {}
