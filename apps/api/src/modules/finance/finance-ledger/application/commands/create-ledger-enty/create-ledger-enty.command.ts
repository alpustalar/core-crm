import { LedgerCategory, LedgerSource, LedgerType } from '@prisma/client';
import { IGetContext } from '@common/decorators';

export interface CreateLedgerEntryDto {
  organizationId: string;
  clinicId: string;
  patientId?: string | null;
  paymentId?: string | null;
  installmentId?: string | null;
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

export class CreateLedgerEntyCommand {
  constructor(
    public readonly dto: CreateLedgerEntryDto,
    public readonly ctx: IGetContext
  ) {}
}
