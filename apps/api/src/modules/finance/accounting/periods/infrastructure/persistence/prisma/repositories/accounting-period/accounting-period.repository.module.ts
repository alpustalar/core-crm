import { Module } from '@nestjs/common';
import { AccountingPeriodCommandRepository } from './accounting-period.command.repository';
import { AccountingPeriodQueryRepository } from './accounting-period.query.repository';
import { ACCOUNTING_PERIOD_COMMAND_REPOSITORY } from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.command.repository';
import { ACCOUNTING_PERIOD_QUERY_REPOSITORY } from '@modules/finance/accounting/periods/domain/repositories/accounting-period/accounting-period.query.repository';

@Module({
  providers: [
    {
      provide: ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
      useClass: AccountingPeriodCommandRepository,
    },
    {
      provide: ACCOUNTING_PERIOD_QUERY_REPOSITORY,
      useClass: AccountingPeriodQueryRepository,
    },
  ],
  exports: [
    ACCOUNTING_PERIOD_COMMAND_REPOSITORY,
    ACCOUNTING_PERIOD_QUERY_REPOSITORY,
  ],
})
export class AccountingPeriodRepositoryModule {}
