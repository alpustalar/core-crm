import { Money } from '@src/domain/value-objects/money.vo';

export const BILLING_ADAPTER = Symbol('IBillingAdapter');

export interface SubscriptionBuyerInfo {
  id: string;
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  ip: string;
  city?: string;
  address?: string;
}

export interface InitSubscriptionPaymentInput {
  organizationId: string;
  amount: Money;
  label: string;
  buyer: SubscriptionBuyerInfo;
}

/** iyzico kart saklama token'ları — sonraki dönemlerde otomatik tahsilat için. */
export interface SavedCardRef {
  cardUserKey: string;
  cardToken: string;
}

/** İlk ödemede müşteri kartını sakladıysa yakalanan token + alıcı snapshot + görüntüleme metadata'sı. */
export interface CapturedSavedCard extends SavedCardRef {
  maskedNumber?: string;
  cardAssociation?: string;
  cardFamily?: string;
  buyer: SubscriptionBuyerInfo;
}

export interface PaymentResult {
  success: boolean;
  iyzicoPaymentId?: string;
  errorMessage?: string;
  /** Müşteri kartını sakladıysa dolu — recurring auto-charge için persist edilir. */
  savedCard?: CapturedSavedCard;
}

/** Kayıtlı kartla otomatik tahsilat girişi (yenileme). */
export interface ChargeSavedCardInput {
  organizationId: string;
  amount: Money;
  label: string;
  savedCard: SavedCardRef;
  buyer: SubscriptionBuyerInfo;
}

export interface IBillingAdapter {
  initializePayment(
    input: InitSubscriptionPaymentInput
  ): Promise<{ checkoutUrl: string; conversationId: string }>;
  handlePaymentResult(token: string): Promise<PaymentResult>;
  /** Kayıtlı kartla (kart saklama) non-3DS otomatik tahsilat — abonelik yenilemesi. */
  chargeSavedCard(input: ChargeSavedCardInput): Promise<PaymentResult>;
  cancelPayment(iyzicoPaymentId: string, ip: string): Promise<void>;
}
