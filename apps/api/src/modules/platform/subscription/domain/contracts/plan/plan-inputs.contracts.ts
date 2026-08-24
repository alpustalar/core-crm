import { PlanIdType as PlanId } from '@input-type-schemas/PlanIdSchema';
import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';

// name min(1) HTTP sınırında (UpsertPlanSchema, @shared/modules/subscription)
// doğrulanır; monthlyPrice nonnegative Money.create() içinde (money.vo.ts) zaten
// enforce edilir — domain katmanı tekrar etmez.

/** Plan tanımı oluşturma/güncelleme (admin) — sabit planId'ye fiyat + isim. */
export interface CreatePlanProps {
  id?: string;
  planId: PlanId;
  name: string; // Plan ismi zorunludur
  monthlyPrice: number; // Fiyat negatif olamaz
  currency: Currency;
}
