import { Injectable } from '@nestjs/common';
import { IFinanceLedgerRepository } from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import { Pagination } from '@shared';
import { FinanceLedger } from '@prisma/client';

export interface GetLedgerByClinicIdInput {
  clinicId: string;
  pagination: Pagination;
}

@Injectable()
export class GetLedgerByClinicIdUseCase {
  constructor(
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  execute({ clinicId, pagination }: GetLedgerByClinicIdInput): Promise<{
    items: FinanceLedger[];
    total: number;
  }> {
    return this.financeLedgerRepository.findManyByClinicId(
      clinicId,
      pagination
    );
  }
}
