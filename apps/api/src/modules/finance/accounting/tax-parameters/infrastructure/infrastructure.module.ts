import { Module } from '@nestjs/common';
import { TaxParameterRepositoriesModule } from '@modules/finance/accounting/tax-parameters/infrastructure/persistence/prisma/repositories/repositories.module';

const InfrastructureModules = [TaxParameterRepositoriesModule];
@Module({
  imports: [...InfrastructureModules],
  exports: [...InfrastructureModules],
})
export class TaxParameterInfrastructureModule {}
