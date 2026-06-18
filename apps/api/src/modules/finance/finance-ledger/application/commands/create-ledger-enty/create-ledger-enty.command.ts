import { IGetContext } from '@common/decorators';
import { LedgerTypeType as LedgerType } from '@input-type-schemas/LedgerTypeSchema';
import { LedgerSourceType as LedgerSource } from '@input-type-schemas/LedgerSourceSchema';
import { LedgerCategoryType as LedgerCategory } from '@input-type-schemas/LedgerCategorySchema';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

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
  currency: CurrencyType;
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
