import { Module } from '@nestjs/common';
import { CreateBankAccountHandler } from './create-bank-account/create-bank-account.handler';
import { ArchiveBankAccountHandler } from './archive-bank-account/archive-bank-account.handler';
import { ImportBankStatementHandler } from './import-bank-statement/import-bank-statement.handler';
import { ReconcileStatementLineHandler } from './reconcile-statement-line/reconcile-statement-line.handler';
import { AutoMatchStatementLinesHandler } from './auto-match-statement-lines/auto-match-statement-lines.handler';
import { BankInfrastructureModule } from '@modules/finance/bank/infrastructure/infrastructure.module';

export const BANK_COMMAND_HANDLERS = [
  CreateBankAccountHandler,
  ArchiveBankAccountHandler,
  ImportBankStatementHandler,
  ReconcileStatementLineHandler,
  AutoMatchStatementLinesHandler,
];

@Module({
  // PostingQueryModule: oto-eşleştirme 102 adaylarını QueryBus üzerinden çeker.
  imports: [BankInfrastructureModule],
  providers: BANK_COMMAND_HANDLERS,
  exports: BANK_COMMAND_HANDLERS,
})
export class BankCommandModule {}
