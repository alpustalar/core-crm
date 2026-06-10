import { Module } from '@nestjs/common';
import { GetChartOfAccountsHandler } from './get-chart-of-accounts/get-chart-of-accounts.handler';
import { AccountRepositoryModule } from '@modules/finance/accounting/chart-of-accounts/infrastructure/persistence/prisma/repositories/account/account.repository.module';

const QueryHandlers = [GetChartOfAccountsHandler];

@Module({
  imports: [AccountRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ChartOfAccountsQueryModule {}
