import { Module } from '@nestjs/common';
import { FinancialEventCommandModule } from './application/commands/command.module';
import { FinancialEventQueryModule } from './application/queries/query.module';
import { FinancialEventPresentationModule } from './presentation/financial-event-presentation.module';

@Module({
  imports: [
    FinancialEventCommandModule,
    FinancialEventQueryModule,
    FinancialEventPresentationModule,
  ],
  exports: [FinancialEventCommandModule, FinancialEventQueryModule],
})
export class FinancialEventModule {}
