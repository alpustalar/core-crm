import { LedgerSourceType } from '@input-type-schemas/LedgerSourceSchema';
import { LedgerTypeType as LedgerType } from '@input-type-schemas/LedgerTypeSchema';
import { LedgerCategoryType } from '@input-type-schemas/LedgerCategorySchema';
import { Money } from '@src/domain/value-objects/money.vo';

export interface CreateFinanceLedgerProps {
  organizationId: string;
  clinicId: string;
  patientId?: string | null;
  paymentId?: string | null;
  installmentId?: string | null;
  performedById?: string | null;
  type: LedgerType;
  source: LedgerSourceType;
  category: LedgerCategoryType;
  money: Money;
  taxRate?: number;
  description?: string;
  documentNo?: string;
  entryDate?: Date;
}
