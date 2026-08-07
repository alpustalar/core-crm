import { Module } from '@nestjs/common';
import { InitializeChartOfAccountsHandler } from './initialize-chart-of-accounts/initialize-chart-of-accounts.handler';
import { AccountRepositoriesModule } from '@modules/finance/accounting/chart-of-accounts/infrastructure/persistence/prisma/repositories/repositories.module';

const CommandHandlers = [InitializeChartOfAccountsHandler];

@Module({
  imports: [AccountRepositoriesModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ChartOfAccountsCommandModule {}
