import Iyzipay from 'iyzipay';
import { LedgerSource } from '@prisma/client';
import {
  CheckoutFormInitializeRequest,
  WithIyzicoError,
} from '../iyzico.client';

export interface CancelPaymentInput {
  conversationId: string;
  paymentId: string;
  ip: string;
}

export interface RetrieveCheckoutFormResult {
  isSuccess: boolean;
  paymentId: string;
  paymentTransactionId: string | undefined;
  errorCode: string | undefined;
  errorMessage: string | undefined;
  rawResponse: unknown;
}

export interface IIyzicoProvider {
  readonly name: LedgerSource;

  paymentInitialize(
    request: CheckoutFormInitializeRequest
  ): Promise<
    WithIyzicoError<
      Iyzipay.CheckoutFormInitialResult & { paymentPageUrl?: string }
    >
  >;

  refund(
    data: Iyzipay.RefundRequestData
  ): Promise<WithIyzicoError<Iyzipay.RefundResult>>;

  retrieveCheckoutForm(token: string): Promise<RetrieveCheckoutFormResult>;

  getInstallmentInfo(
    data: Iyzipay.InstallmentInfoRequestData
  ): Promise<WithIyzicoError<Iyzipay.InstallmentInfoResult>>;

  cancelPayment(
    input: CancelPaymentInput
  ): Promise<WithIyzicoError<Iyzipay.CancelPaymentResult>>;

  getCallbackUrl(): string;
}
