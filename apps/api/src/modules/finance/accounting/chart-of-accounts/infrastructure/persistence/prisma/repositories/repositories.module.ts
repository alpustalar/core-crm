import { Module } from '@nestjs/common';
import { AccountRepositoryModule } from '@modules/finance/accounting/chart-of-accounts/infrastructure/persistence/prisma/repositories/account/account.repository.module';

const RepositoriesModules = [AccountRepositoryModule];
@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class AccountRepositoriesModule {}
