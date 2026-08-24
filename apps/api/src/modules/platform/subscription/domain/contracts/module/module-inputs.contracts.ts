import { CurrencyType as Currency } from '@input-type-schemas/CurrencySchema';

// key/name min(1) HTTP sınırında (CreateModuleSchema, @shared/modules/subscription)
// doğrulanır; monthlyPrice nonnegative Money.create() içinde (money.vo.ts) zaten
// enforce edilir — domain katmanı tekrar etmez.

export interface ModuleCreateProps {
  id?: string;
  key: string; // Modül anahtarı zorunludur
  name: string; // Modül ismi zorunludur
  description?: string | null; // Açıklama 500 karakteri geçemez

  monthlyPrice: number; // Fiyat negatif olamaz
  currency: Currency;
}

/** Modül güncelleme (admin) — verilen alanlar uygulanır. */
export interface UpdateModuleProps {
  name?: string;
  description?: string | null;
  monthlyPrice?: number;
  currency?: Currency;
  isActive?: boolean;
}
