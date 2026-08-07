import { Module } from '@nestjs/common';
import { GetChartOfAccountsHandler } from './get-chart-of-accounts/get-chart-of-accounts.handler';
import { AccountRepositoriesModule } from '@modules/finance/accounting/chart-of-accounts/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [GetChartOfAccountsHandler];

@Module({
  imports: [AccountRepositoriesModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ChartOfAccountsQueryModule {}
