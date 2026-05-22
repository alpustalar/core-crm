import { Module } from '@nestjs/common';
import { FinanceLedgerController } from './controllers/finance-ledger.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { FinanceLedgerCommandModule } from '@modules/finance-ledger/application/commands/command.module';
import { FinanceLedgerQueryModule } from '@modules/finance-ledger/application/queries/query.module';

@Module({
  imports: [CqrsModule, FinanceLedgerCommandModule, FinanceLedgerQueryModule],
  controllers: [FinanceLedgerController],
})
export class FinanceLedgerPresentationModule {}
