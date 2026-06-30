import Iyzipay from 'iyzipay';

export type PaymentInitializeRequest = Omit<
  Iyzipay.PaymentRequestData,
  'installments' | 'paymentCard'
> & {
  enabledInstallments?: number[];
  /** Varsayılan callback yerine işlem-bazlı callback (ör. sağlık turizmi booking callback). */
  callbackUrl?: string;
};
