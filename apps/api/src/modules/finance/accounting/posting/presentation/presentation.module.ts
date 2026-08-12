import { Module } from '@nestjs/common';
import { JournalQueryController } from '@modules/finance/accounting/posting/presentation/http/controllers/journal.query.controller';
import { JournalCommandController } from '@modules/finance/accounting/posting/presentation/http/controllers/journal.command.controller';
import { AccountingReportsQueryController } from '@modules/finance/accounting/posting/presentation/http/controllers/accounting-reports.query.controller';

@Module({ controllers: [JournalQueryController, JournalCommandController, AccountingReportsQueryController] })
export class PostingPresentationModule {}
