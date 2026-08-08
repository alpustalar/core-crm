import { Module } from '@nestjs/common';
import { AccountRepositoriesModule } from '@modules/finance/accounting/chart-of-accounts/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [AccountRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class ChartOfAccountsInfrastructureModule {}
