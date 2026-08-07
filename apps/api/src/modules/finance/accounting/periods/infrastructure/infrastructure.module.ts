import { Module } from '@nestjs/common';
import { AccountingPeriodRepositoriesModule } from '@modules/finance/accounting/periods/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [AccountingPeriodRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class AccountingPeriodInfrastructureModule {}
