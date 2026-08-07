import { Module } from '@nestjs/common';
import { RecordFinancialEventHandler } from './record-financial-event/record-financial-event.handler';
import { FinancialEventRepositoriesModule } from '@modules/finance/accounting/financial-events/infrastructure/persistence/prisma/repositories/repositories.module';

const CommandHandlers = [RecordFinancialEventHandler];

@Module({
  imports: [FinancialEventRepositoriesModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class FinancialEventCommandModule {}
