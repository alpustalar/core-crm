import { Module } from '@nestjs/common';
import { FinanceLedgerController } from './controllers/finance-ledger.controller';
import { FinanceLedgerCommandModule } from '@modules/finance/finance-ledger/application/commands/command.module';
import { FinanceLedgerQueryModule } from '@modules/finance/finance-ledger/application/queries/query.module';

@Module({
  imports: [FinanceLedgerCommandModule, FinanceLedgerQueryModule],
  controllers: [FinanceLedgerController],
})
export class FinanceLedgerPresentationModule {}
