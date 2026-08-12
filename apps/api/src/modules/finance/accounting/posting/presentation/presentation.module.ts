import { Module } from '@nestjs/common';
import { JournalQueryController } from '@modules/finance/accounting/posting/presentation/http/controllers/journal.query.controller';
import { JournalCommandController } from '@modules/finance/accounting/posting/presentation/http/controllers/journal.command.controller';
import { AccountingReportsController } from '@modules/finance/accounting/posting/presentation/http/controllers/accounting-reports.controller';

@Module({ controllers: [JournalQueryController, JournalCommandController, AccountingReportsController] })
export class PostingPresentationModule {}
