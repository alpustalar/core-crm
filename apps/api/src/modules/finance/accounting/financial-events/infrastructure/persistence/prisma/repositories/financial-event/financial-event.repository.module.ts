import { Module } from '@nestjs/common';
import {
  FINANCIAL_EVENT_COMMAND_REPOSITORY,
  FINANCIAL_EVENT_QUERY_REPOSITORY,
} from '@modules/finance/accounting/financial-events/domain/repositories/financial-event.repository';
import { FinancialEventCommandRepository } from './financial-event.command.repository';
import { FinancialEventQueryRepository } from './financial-event.query.repository';

@Module({
  providers: [
    {
      provide: FINANCIAL_EVENT_COMMAND_REPOSITORY,
      useClass: FinancialEventCommandRepository,
    },
    {
      provide: FINANCIAL_EVENT_QUERY_REPOSITORY,
      useClass: FinancialEventQueryRepository,
    },
  ],
  exports: [
    FINANCIAL_EVENT_COMMAND_REPOSITORY,
    FINANCIAL_EVENT_QUERY_REPOSITORY,
  ],
})
export class FinancialEventRepositoryModule {}
