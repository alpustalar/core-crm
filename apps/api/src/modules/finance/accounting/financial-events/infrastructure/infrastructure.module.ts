import { Module } from '@nestjs/common';
import { FinancialEventRepositoriesModule } from '@modules/finance/accounting/financial-events/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [FinancialEventRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class FinancialEventInfrastructureModule {}
