import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBankAccountHandler } from './create-bank-account/create-bank-account.handler';
import { ArchiveBankAccountHandler } from './archive-bank-account/archive-bank-account.handler';
import { ImportBankStatementHandler } from './import-bank-statement/import-bank-statement.handler';
import { ReconcileStatementLineHandler } from './reconcile-statement-line/reconcile-statement-line.handler';
import { AutoMatchStatementLinesHandler } from './auto-match-statement-lines/auto-match-statement-lines.handler';
import { BankRepositoryModule } from '@modules/finance/bank/infrastructure/persistence/prisma/repositories/bank.repository.module';
import { PostingQueryModule } from '@modules/finance/accounting/posting/application/queries/query.module';

export const BANK_COMMAND_HANDLERS = [
  CreateBankAccountHandler,
  ArchiveBankAccountHandler,
  ImportBankStatementHandler,
  ReconcileStatementLineHandler,
  AutoMatchStatementLinesHandler,
];

@Module({
  // PostingQueryModule: oto-eşleştirme 102 adaylarını QueryBus üzerinden çeker.
  imports: [CqrsModule, BankRepositoryModule, PostingQueryModule],
  providers: BANK_COMMAND_HANDLERS,
  exports: BANK_COMMAND_HANDLERS,
})
export class BankCommandModule {}
