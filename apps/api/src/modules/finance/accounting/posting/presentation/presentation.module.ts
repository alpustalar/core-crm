import { Module } from '@nestjs/common';
import { JournalController } from '@modules/finance/accounting/posting/presentation/http/controllers/journal.controller';
import { AccountingReportsController } from '@modules/finance/accounting/posting/presentation/http/controllers/accounting-reports.controller';

@Module({ controllers: [JournalController, AccountingReportsController] })
export class PostingPresentationModule {}
