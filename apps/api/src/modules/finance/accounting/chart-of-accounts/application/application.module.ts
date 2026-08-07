import { Module } from '@nestjs/common';
import { ChartOfAccountsCommandModule } from '@modules/finance/accounting/chart-of-accounts/application/commands/command.module';
import { ChartOfAccountsQueryModule } from '@modules/finance/accounting/chart-of-accounts/application/queries/query.module';

const ApplicationModules = [
  ChartOfAccountsCommandModule,
  ChartOfAccountsQueryModule,
];
@Module({
  imports: [...ApplicationModules],
  exports: [...ApplicationModules],
})
export class ChartOfAccountsApplicationModule {}
