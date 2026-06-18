import { Module } from '@nestjs/common';
import { InitializeTaxParametersHandler } from './initialize-tax-parameters/initialize-tax-parameters.handler';
import { SetTaxParameterHandler } from './set-tax-parameter/set-tax-parameter.handler';
import { TaxParameterRepositoryModule } from '@modules/finance/accounting/tax-parameters/infrastructure/persistence/prisma/repositories/tax-parameter/tax-parameter.repository.module';

const CommandHandlers = [InitializeTaxParametersHandler, SetTaxParameterHandler];

@Module({
  imports: [TaxParameterRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class TaxParameterCommandModule {}
