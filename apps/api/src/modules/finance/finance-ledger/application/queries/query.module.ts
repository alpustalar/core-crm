import { GetPatientFinanceSummaryHandler } from './get-patient-finance-summary/get-patient-finance-summary.handler';
import { GetLedgerByPatientIdHandler } from './get-ledger-by-patient-id/get-ledger-by-patient-id.handler';
import { GetLedgerByClinicIdHandler } from './get-ledger-by-clinic-id/get-ledger-by-clinic-id.handler';
import { Module } from '@nestjs/common';
import { GetClinicFinanceSummaryHandler } from './get-clinic-finance-summary/get-clinic-finance-summary.handler';
import { FINANCE_LEDGER_REPOSITORY } from '@modules/finance/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { FinanceLedgerRepository } from '@modules/finance/finance-ledger/infrastructure/persistence/prisma/repositories/finance-ledger.repository';

const QueryHandlers = [
  GetPatientFinanceSummaryHandler,
  GetLedgerByPatientIdHandler,
  GetLedgerByClinicIdHandler,
  GetClinicFinanceSummaryHandler,
];

@Module({
  providers: [
    ...QueryHandlers,
    { provide: FINANCE_LEDGER_REPOSITORY, useClass: FinanceLedgerRepository },
  ],
  exports: [...QueryHandlers],
})
export class FinanceLedgerQueryModule {}
