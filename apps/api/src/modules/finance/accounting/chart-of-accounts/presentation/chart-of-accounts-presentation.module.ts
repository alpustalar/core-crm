import { Module } from '@nestjs/common';
import { ChartOfAccountsController } from './controllers/chart-of-accounts.controller';
import { ChartOfAccountsCommandModule } from '@modules/finance/accounting/chart-of-accounts/application/commands/command.module';
import { ChartOfAccountsQueryModule } from '@modules/finance/accounting/chart-of-accounts/application/queries/query.module';

@Module({
  imports: [ChartOfAccountsCommandModule, ChartOfAccountsQueryModule],
  controllers: [ChartOfAccountsController],
})
export class ChartOfAccountsPresentationModule {}
