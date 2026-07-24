import { Module } from '@nestjs/common';
import {
  BANK_ACCOUNT_COMMAND_REPOSITORY,
  BANK_ACCOUNT_QUERY_REPOSITORY,
} from '@modules/finance/bank/domain/repositories/bank-account.repository';
import {
  BANK_STATEMENT_COMMAND_REPOSITORY,
  BANK_STATEMENT_QUERY_REPOSITORY,
} from '@modules/finance/bank/domain/repositories/bank-statement.repository';
import { BANK_STATEMENT_LINE_COMMAND_REPOSITORY } from '@modules/finance/bank/domain/repositories/bank-statement-line.repository';
import { BankAccountCommandRepository } from './bank-account.command.repository';
import { BankAccountQueryRepository } from './bank-account.query.repository';
import { BankStatementCommandRepository } from './bank-statement.command.repository';
import { BankStatementQueryRepository } from './bank-statement.query.repository';
import { BankStatementLineCommandRepository } from './bank-statement-line.command.repository';

@Module({
  providers: [
    {
      provide: BANK_ACCOUNT_COMMAND_REPOSITORY,
      useClass: BankAccountCommandRepository,
    },
    {
      provide: BANK_ACCOUNT_QUERY_REPOSITORY,
      useClass: BankAccountQueryRepository,
    },
    {
      provide: BANK_STATEMENT_COMMAND_REPOSITORY,
      useClass: BankStatementCommandRepository,
    },
    {
      provide: BANK_STATEMENT_QUERY_REPOSITORY,
      useClass: BankStatementQueryRepository,
    },
    {
      provide: BANK_STATEMENT_LINE_COMMAND_REPOSITORY,
      useClass: BankStatementLineCommandRepository,
    },
  ],
  exports: [
    BANK_ACCOUNT_COMMAND_REPOSITORY,
    BANK_ACCOUNT_QUERY_REPOSITORY,
    BANK_STATEMENT_COMMAND_REPOSITORY,
    BANK_STATEMENT_QUERY_REPOSITORY,
    BANK_STATEMENT_LINE_COMMAND_REPOSITORY,
  ],
})
export class BankRepositoryModule {}
