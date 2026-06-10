import { Module } from '@nestjs/common';
import { InitializeChartOfAccountsHandler } from './initialize-chart-of-accounts/initialize-chart-of-accounts.handler';
import { AccountRepositoryModule } from '@modules/finance/accounting/chart-of-accounts/infrastructure/persistence/prisma/repositories/account/account.repository.module';

const CommandHandlers = [InitializeChartOfAccountsHandler];

@Module({
  imports: [AccountRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ChartOfAccountsCommandModule {}
