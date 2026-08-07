import { Module } from '@nestjs/common';
import { JournalController } from './controllers/journal.controller';
import { AccountingReportsController } from './controllers/accounting-reports.controller';
import { PostingApplicationModule } from '@modules/finance/accounting/posting/application/application.module';

@Module({
  imports: [PostingApplicationModule],
  controllers: [JournalController, AccountingReportsController],
})
export class PostingPresentationModule {}
