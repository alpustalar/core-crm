import { Module } from '@nestjs/common';
import { AccountingPeriodController } from './controllers/accounting-period.controller';
import { AccountingPeriodCommandModule } from '@modules/finance/accounting/periods/application/commands/command.module';
import { AccountingPeriodQueryModule } from '@modules/finance/accounting/periods/application/queries/query.module';

@Module({
  imports: [AccountingPeriodCommandModule, AccountingPeriodQueryModule],
  controllers: [AccountingPeriodController],
})
export class AccountingPeriodPresentationModule {}
