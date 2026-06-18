import { Module } from '@nestjs/common';
import { GetTaxRateHandler } from './get-tax-rate/get-tax-rate.handler';
import { GetTaxParametersHandler } from './get-tax-parameters/get-tax-parameters.handler';
import { TaxParameterRepositoryModule } from '@modules/finance/accounting/tax-parameters/infrastructure/persistence/prisma/repositories/tax-parameter/tax-parameter.repository.module';

const QueryHandlers = [GetTaxRateHandler, GetTaxParametersHandler];

@Module({
  imports: [TaxParameterRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class TaxParameterQueryModule {}
