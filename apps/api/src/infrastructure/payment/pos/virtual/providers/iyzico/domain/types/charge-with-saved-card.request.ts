import type { CurrencyType } from '@input-type-schemas/CurrencySchema';

/** Kayıtlı kartla (kart saklama) non-3DS tahsilat için alıcı bilgisi — payment.create'i besler. */
export interface SavedCardBuyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  ip: string;
  city?: string;
  address?: string;
}

/** iyzico non-3DS `payment.create` (kayıtlı kart) isteği — otomatik yenileme tahsilatı. */
export interface ChargeWithSavedCardRequest {
  conversationId: string;
  price: string;
  currency: CurrencyType;
  basketId: string;
  basketItemLabel: string;
  savedCard: { cardUserKey: string; cardToken: string };
  buyer: SavedCardBuyer;
}

/** Kayıtlı kart tahsilatı sonucu (sadeleştirilmiş). */
export interface ChargeWithSavedCardResult {
  isSuccess: boolean;
  paymentId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse: unknown;
}
