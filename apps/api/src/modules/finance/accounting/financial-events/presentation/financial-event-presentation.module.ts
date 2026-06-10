import { Module } from '@nestjs/common';
import { FinancialEventController } from './controllers/financial-event.controller';
import { FinancialEventQueryModule } from '@modules/finance/accounting/financial-events/application/queries/query.module';

@Module({
  imports: [FinancialEventQueryModule],
  controllers: [FinancialEventController],
})
export class FinancialEventPresentationModule {}
