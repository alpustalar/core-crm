import { Module } from '@nestjs/common';
import { FinanceLedgerController } from '@modules/finance/finance-ledger/presentation/http/controllers/finance-ledger.controller';

@Module({ controllers: [FinanceLedgerController] })
export class FinanceLedgerPresentationModule {}
