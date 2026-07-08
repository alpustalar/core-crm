/** Checkout form'da müşteri kartını sakladıysa iyzico'nun döndürdüğü kart saklama token'ları. */
export interface RetrieveCheckoutFormSavedCard {
  cardUserKey: string;
  cardToken: string;
  binNumber?: string;
  lastFourDigits?: string;
  cardAssociation?: string;
  cardFamily?: string;
}

/** Checkout form retrieve'de dönen alıcı bilgisi (gönderilen buyer'ın yankısı). */
export interface RetrieveCheckoutFormBuyer {
  id?: string;
  name?: string;
  surname?: string;
  email?: string;
  gsmNumber?: string;
  ip?: string;
  city?: string;
  address?: string;
}

export interface RetrieveCheckoutFormResult {
  isSuccess: boolean;
  paymentId: string;
  paymentTransactionId: string | undefined;
  errorCode: string | undefined;
  errorMessage: string | undefined;
  /** Müşteri kartını sakladıysa dolu — recurring auto-charge için token'lar. */
  savedCard?: RetrieveCheckoutFormSavedCard;
  /** Ödemedeki alıcı bilgisi — yenileme snapshot'ı için. */
  buyer?: RetrieveCheckoutFormBuyer;
  rawResponse: unknown;
}
