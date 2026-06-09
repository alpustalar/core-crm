import { LedgerCategory, LedgerSource, LedgerType } from '@prisma/client';

export interface CreateFinanceLedgerProps {
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
