import { Module } from '@nestjs/common';
import { FinanceLedgerController } from './controllers/finance-ledger.controller';
import { FinanceLedgerUseCaseModule } from '../application/use-cases/finance-ledger-use-case.module';

@Module({
  imports: [FinanceLedgerUseCaseModule],
  controllers: [FinanceLedgerController],
})
export class FinanceLedgerPresentationModule {}
