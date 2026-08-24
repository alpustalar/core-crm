import { Decimal } from 'decimal.js';
import { ProjectCostSourceType as CostSource } from '@input-type-schemas/ProjectCostSourceSchema';

/** Aşama bazında maliyet toplamı (bütçe-vs-fiili raporunun ham verisi). */
export interface ProjectCostTotalRow {
  phaseId: string | null;
  source: CostSource;
  total: Decimal;
}
