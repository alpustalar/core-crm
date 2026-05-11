import { Injectable } from '@nestjs/common';
import {
  GetSummaryFilter,
  IFinanceLedgerRepository,
  LedgerSummary,
} from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';

export interface GetClinicFinanceSummaryInput {
  clinicId: string;
  filter: GetSummaryFilter;
}

@Injectable()
export class GetClinicFinanceSummaryUseCase {
  constructor(
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  execute({
    clinicId,
    filter,
  }: GetClinicFinanceSummaryInput): Promise<LedgerSummary> {
    return this.financeLedgerRepository.getClinicSummary(clinicId, filter);
  }
}
