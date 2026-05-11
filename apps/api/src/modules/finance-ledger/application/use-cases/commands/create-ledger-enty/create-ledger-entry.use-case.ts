import { Injectable } from '@nestjs/common';
import { IFinanceLedgerRepository } from '@modules/finance-ledger/domain/repositories/finance-ledger.repository.interface';
import {
  FinanceLedger,
  LedgerCategory,
  LedgerSource,
  LedgerType,
} from '@prisma/client';

export interface CreateLedgerEntryInput {
  clinicId: string;
  patientId?: string | null;
  paymentId?: string | null;
  performedById?: string | null;
  type: LedgerType;
  source: LedgerSource;
  category: LedgerCategory;
  amount: string;
  currency?: string;
  taxRate?: number;
  description?: string;
  documentNo?: string;
  entryDate?: Date;
}

@Injectable()
export class CreateLedgerEntryUseCase {
  constructor(
    private readonly financeLedgerRepository: IFinanceLedgerRepository
  ) {}

  execute(input: CreateLedgerEntryInput): Promise<FinanceLedger> {
    return this.financeLedgerRepository.create({
      ...input,
      currency: input.currency ?? 'TRY',
    });
  }
}
