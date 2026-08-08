import { Module } from '@nestjs/common';
import { FinanceLedgerRepositoriesModule } from '@modules/finance/finance-ledger/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [FinanceLedgerRepositoriesModule];

@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class InfrastructureModule {}
