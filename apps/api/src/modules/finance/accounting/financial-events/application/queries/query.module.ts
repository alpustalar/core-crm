import { Module } from '@nestjs/common';
import { GetFinancialEventsHandler } from './get-financial-events/get-financial-events.handler';
import { GetFinancialEventByIdHandler } from './get-financial-event-by-id/get-financial-event-by-id.handler';
import { FinancialEventRepositoryModule } from '@modules/finance/accounting/financial-events/infrastructure/persistence/prisma/repositories/financial-event/financial-event.repository.module';

const QueryHandlers = [GetFinancialEventsHandler, GetFinancialEventByIdHandler];

@Module({
  imports: [FinancialEventRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class FinancialEventQueryModule {}
