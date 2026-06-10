import { Module } from '@nestjs/common';
import { AccountingPeriodCommandModule } from './application/commands/command.module';
import { AccountingPeriodQueryModule } from './application/queries/query.module';
import { AccountingPeriodPresentationModule } from './presentation/accounting-period-presentation.module';

@Module({
  imports: [
    AccountingPeriodCommandModule,
    AccountingPeriodQueryModule,
    AccountingPeriodPresentationModule,
  ],
  exports: [AccountingPeriodCommandModule, AccountingPeriodQueryModule],
})
export class AccountingPeriodModule {}
