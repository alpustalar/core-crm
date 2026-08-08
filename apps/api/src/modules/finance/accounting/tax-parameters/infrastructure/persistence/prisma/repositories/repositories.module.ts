import { Module } from '@nestjs/common';
import { TaxParameterRepositoryModule } from '@modules/finance/accounting/tax-parameters/infrastructure/persistence/prisma/repositories/tax-parameter/tax-parameter.repository.module';

const RepositoriesModules = [TaxParameterRepositoryModule];

@Module({
  imports: [...RepositoriesModules],
  exports: [...RepositoriesModules],
})
export class TaxParameterRepositoriesModule {}
