import { Module } from '@nestjs/common';
import { FinanceLedgerQueryController } from '@modules/finance/finance-ledger/presentation/http/controllers/finance-ledger.query.controller';

@Module({ controllers: [FinanceLedgerQueryController] })
export class FinanceLedgerPresentationModule {}
