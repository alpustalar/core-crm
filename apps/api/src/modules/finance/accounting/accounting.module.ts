import { Module } from '@nestjs/common';
import { ChartOfAccountsModule } from './chart-of-accounts/chart-of-accounts.module';
import { AccountingPeriodModule } from './periods/accounting-period.module';
import { FinancialEventModule } from './financial-events/financial-event.module';
import { PostingModule } from './posting/posting.module';
import { TaxParameterModule } from './tax-parameters/tax-parameter.module';

@Module({
  imports: [
    ChartOfAccountsModule,
    AccountingPeriodModule,
    FinancialEventModule,
    PostingModule,
    TaxParameterModule,
  ],
  exports: [
    ChartOfAccountsModule,
    AccountingPeriodModule,
    FinancialEventModule,
    PostingModule,
    TaxParameterModule,
  ],
})
export class AccountingModule {}
