import { Module } from '@nestjs/common';
import { TaxParameterCommandModule } from './application/commands/command.module';
import { TaxParameterQueryModule } from './application/queries/query.module';
import { TaxParameterPresentationModule } from './presentation/tax-parameter-presentation.module';

@Module({
  imports: [
    TaxParameterCommandModule,
    TaxParameterQueryModule,
    TaxParameterPresentationModule,
  ],
  exports: [TaxParameterCommandModule, TaxParameterQueryModule],
})
export class TaxParameterModule {}
