import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateBankAccountHandler } from './create-bank-account/create-bank-account.handler';
import { ArchiveBankAccountHandler } from './archive-bank-account/archive-bank-account.handler';
import { ImportBankStatementHandler } from './import-bank-statement/import-bank-statement.handler';
import { ReconcileStatementLineHandler } from './reconcile-statement-line/reconcile-statement-line.handler';
import { BankRepositoryModule } from '@modules/finance/bank/infrastructure/persistence/prisma/repositories/bank.repository.module';

export const BANK_COMMAND_HANDLERS = [
  CreateBankAccountHandler,
  ArchiveBankAccountHandler,
  ImportBankStatementHandler,
  ReconcileStatementLineHandler,
];

@Module({
  imports: [CqrsModule, BankRepositoryModule],
  providers: BANK_COMMAND_HANDLERS,
  exports: BANK_COMMAND_HANDLERS,
})
export class BankCommandModule {}
