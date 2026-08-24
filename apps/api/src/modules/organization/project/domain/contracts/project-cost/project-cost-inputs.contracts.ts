import { Decimal } from 'decimal.js';
import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';
import { ProjectCostSourceType as CostSource } from '@input-type-schemas/ProjectCostSourceSchema';

// ==========================================
// MALİYET (COST)
// ==========================================
// description uzunluk sınırı HTTP sınırında (RecordProjectCostSchema,
// @shared/modules/project) zaten doğrulanır; domain katmanı tekrar etmez.

export interface RecordProjectCostProps {
  id?: string;
  projectId: string;
  phaseId?: string | null;
  clinicId: string;
  organizationId: string;
  source?: CostSource;
  sourceRefId?: string | null;
  description: string;
  amount: Decimal;
  currency?: Currency;
  incurredAt: Date;
  recordedById: string;
}
