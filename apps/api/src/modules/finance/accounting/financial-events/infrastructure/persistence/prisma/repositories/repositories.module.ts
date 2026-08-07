import { Module } from '@nestjs/common';
import { FinancialEventRepositoryModule } from '@modules/finance/accounting/financial-events/infrastructure/persistence/prisma/repositories/financial-event/financial-event.repository.module';

const RepositoriesModules = [FinancialEventRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class FinancialEventRepositoriesModule {}
