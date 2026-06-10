import { Module } from '@nestjs/common';
import {
  ACCOUNT_COMMAND_REPOSITORY,
  ACCOUNT_QUERY_REPOSITORY,
} from '@modules/finance/accounting/chart-of-accounts/domain/repositories/account.repository';
import { AccountCommandRepository } from './account.command.repository';
import { AccountQueryRepository } from './account.query.repository';

@Module({
  providers: [
    { provide: ACCOUNT_COMMAND_REPOSITORY, useClass: AccountCommandRepository },
    { provide: ACCOUNT_QUERY_REPOSITORY, useClass: AccountQueryRepository },
  ],
  exports: [ACCOUNT_COMMAND_REPOSITORY, ACCOUNT_QUERY_REPOSITORY],
})
export class AccountRepositoryModule {}
