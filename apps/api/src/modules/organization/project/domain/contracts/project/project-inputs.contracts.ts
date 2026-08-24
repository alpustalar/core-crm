import { Decimal } from 'decimal.js';
import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';

// ==========================================
// PROJE — Entity static create() girişi
// ==========================================
// name/code uzunluk sınırları HTTP sınırında (CreateProjectSchema,
// @shared/modules/project) zaten doğrulanır; domain katmanı tekrar etmez.

export interface CreateProjectProps {
  id?: string;
  clinicId: string;
  organizationId: string;
  code?: string | null;
  name: string;
  description?: string | null;
  ownerId: string;
  startDate?: Date | null;
  dueDate?: Date | null;
  budget?: Decimal | null;
  currency?: Currency;
  createdById: string;
}

/** Proje künyesi güncelleme — durum/tarihçe DEĞİL, yalnız tanım alanları. */
export interface UpdateProjectDetailsProps {
  code?: string | null;
  name?: string;
  description?: string | null;
  ownerId?: string;
  startDate?: Date | null;
  dueDate?: Date | null;
  budget?: Decimal | null;
}
