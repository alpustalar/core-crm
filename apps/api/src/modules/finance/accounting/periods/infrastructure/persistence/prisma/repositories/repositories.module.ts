import { Module } from '@nestjs/common';
import { AccountingPeriodRepositoryModule } from '@modules/finance/accounting/periods/infrastructure/persistence/prisma/repositories/accounting-period/accounting-period.repository.module';

const RepositoriesModules = [AccountingPeriodRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class AccountingPeriodRepositoriesModule {}
