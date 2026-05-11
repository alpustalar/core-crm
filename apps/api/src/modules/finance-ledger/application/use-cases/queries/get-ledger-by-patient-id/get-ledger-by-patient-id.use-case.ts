import { Injectable } from '@nestjs/common';
import { IFinanceLedgerRepository } from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Pagination } from '@shared';
import { FinanceLedger } from '@prisma/client';

export interface GetLedgerByPatientIdInput {
  patientId: string;
  pagination: Pagination;
}

@Injectable()
export class GetLedgerByPatientIdUseCase {
  constructor(
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  execute({ patientId, pagination }: GetLedgerByPatientIdInput): Promise<{
    items: FinanceLedger[];
    total: number;
  }> {
    return this.financeLedgerRepository.findManyByPatientId(
      patientId,
      pagination
    );
  }
}
