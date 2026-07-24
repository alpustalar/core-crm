import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BankRepositoryModule } from '@modules/finance/bank/infrastructure/persistence/prisma/repositories/bank.repository.module';
import { GetBankAccountsHandler } from './get-bank-accounts/get-bank-accounts.handler';
import { GetBankAccountByIdHandler } from './get-bank-account-by-id/get-bank-account-by-id.handler';
import { GetBankStatementsHandler } from './get-bank-statements/get-bank-statements.handler';
import { GetBankStatementByIdHandler } from './get-bank-statement-by-id/get-bank-statement-by-id.handler';
import { GetReconciliationSummaryHandler } from './get-reconciliation-summary/get-reconciliation-summary.handler';

export const BANK_QUERY_HANDLERS = [
  GetBankAccountsHandler,
  GetBankAccountByIdHandler,
  GetBankStatementsHandler,
  GetBankStatementByIdHandler,
  GetReconciliationSummaryHandler,
];

@Module({
  imports: [CqrsModule, BankRepositoryModule],
  providers: BANK_QUERY_HANDLERS,
  exports: BANK_QUERY_HANDLERS,
})
export class BankQueryModule {}
