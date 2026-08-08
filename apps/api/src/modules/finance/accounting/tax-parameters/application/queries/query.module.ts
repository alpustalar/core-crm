import { Module } from '@nestjs/common';
import { GetTaxRateHandler } from './get-tax-rate/get-tax-rate.handler';
import { GetTaxParametersHandler } from './get-tax-parameters/get-tax-parameters.handler';
import { TaxParameterRepositoriesModule } from '@modules/finance/accounting/tax-parameters/infrastructure/persistence/prisma/repositories/repositories.module';

const QueryHandlers = [GetTaxRateHandler, GetTaxParametersHandler];

@Module({
  imports: [TaxParameterRepositoriesModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class TaxParameterQueryModule {}
