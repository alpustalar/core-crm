import { Module } from '@nestjs/common';
import { FinanceLedgerRepository } from '@modules/finance-ledger/infrastructure/persistence/prisma/repositories/finance-ledger.repository';
import { IFinanceLedgerRepository } from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import {
  CreateLedgerEntryUseCase,
  RefundLedgerEntriesUseCase,
} from './commands';
import {
  GetClinicFinanceSummaryUseCase,
  GetLedgerByClinicIdUseCase,
  GetLedgerByPatientIdUseCase,
} from './queries';

const UseCases = [
  CreateLedgerEntryUseCase,
  RefundLedgerEntriesUseCase,
  GetLedgerByClinicIdUseCase,
  GetLedgerByPatientIdUseCase,
  GetClinicFinanceSummaryUseCase,
];

@Module({
  providers: [
    ...UseCases,
    { provide: IFinanceLedgerRepository, useClass: FinanceLedgerRepository },
  ],
  exports: [...UseCases],
})
export class FinanceLedgerUseCaseModule {}
