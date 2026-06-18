import { Module } from '@nestjs/common';
import {
  TAX_PARAMETER_COMMAND_REPOSITORY,
  TAX_PARAMETER_QUERY_REPOSITORY,
} from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter.repository';
import { TaxParameterCommandRepository } from './tax-parameter.command.repository';
import { TaxParameterQueryRepository } from './tax-parameter.query.repository';

@Module({
  providers: [
    {
      provide: TAX_PARAMETER_COMMAND_REPOSITORY,
      useClass: TaxParameterCommandRepository,
    },
    {
      provide: TAX_PARAMETER_QUERY_REPOSITORY,
      useClass: TaxParameterQueryRepository,
    },
  ],
  exports: [TAX_PARAMETER_COMMAND_REPOSITORY, TAX_PARAMETER_QUERY_REPOSITORY],
})
export class TaxParameterRepositoryModule {}
