import { Module } from '@nestjs/common';
import { InitializeTaxParametersHandler } from './initialize-tax-parameters/initialize-tax-parameters.handler';
import { SetTaxParameterHandler } from './set-tax-parameter/set-tax-parameter.handler';
import { TaxParameterInfrastructureModule } from '@modules/finance/accounting/tax-parameters/infrastructure/infrastructure.module';

const COMMAND_HANDLERS = [
  InitializeTaxParametersHandler,
  SetTaxParameterHandler,
];

@Module({
  imports: [TaxParameterInfrastructureModule],
  providers: [...COMMAND_HANDLERS],
  exports: [...COMMAND_HANDLERS],
})
export class TaxParameterCommandModule {}
