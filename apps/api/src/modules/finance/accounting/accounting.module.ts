import { Module } from '@nestjs/common';
import { ChartOfAccountsModule } from './chart-of-accounts/chart-of-accounts.module';
import { AccountingPeriodModule } from './periods/accounting-period.module';
import { FinancialEventModule } from './financial-events/financial-event.module';
import { PostingModule } from './posting/posting.module';

@Module({
  imports: [
    ChartOfAccountsModule,
    AccountingPeriodModule,
    FinancialEventModule,
    PostingModule,
  ],
  exports: [
    ChartOfAccountsModule,
    AccountingPeriodModule,
    FinancialEventModule,
    PostingModule,
  ],
})
export class AccountingModule {}
