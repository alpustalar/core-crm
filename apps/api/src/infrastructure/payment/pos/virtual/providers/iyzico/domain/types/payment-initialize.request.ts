import Iyzipay from 'iyzipay';

export type PaymentInitializeRequest = Omit<
  Iyzipay.PaymentRequestData,
  'installments' | 'paymentCard'
> & { enabledInstallments?: number[] };
