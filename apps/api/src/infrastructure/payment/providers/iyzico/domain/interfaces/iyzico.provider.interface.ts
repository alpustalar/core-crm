import Iyzipay from 'iyzipay';
import { PaymentInitializeRequest } from '@src/infrastructure/payment/providers/iyzico/domain/types/payment-initialize.request';
import { WithIyzicoError } from '@src/infrastructure/payment/providers/iyzico/domain/types/with-iyzico-error.type';
import { RetrieveCheckoutFormResult } from '@src/infrastructure/payment/providers/iyzico/domain/types/retrieve-checkout-form.result';
import { CancelPaymentRequest } from '@src/infrastructure/payment/providers/iyzico/domain/types/cancel-payment.request';
import {
  CreateSubMerchantRequest,
  SubMerchantResult,
  UpdateSubMerchantRequest,
} from '@src/infrastructure/payment/providers/iyzico/domain/types/create-submerchant.request';

export const IYZICO_PROVIDER = Symbol('IIyzicoProvider');
export interface IIyzicoProvider {
  paymentInitialize(
    request: PaymentInitializeRequest
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
    request: CancelPaymentRequest
  ): Promise<WithIyzicoError<Iyzipay.CancelPaymentResult>>;

  createSubMerchant(request: CreateSubMerchantRequest): Promise<SubMerchantResult>;

  updateSubMerchant(request: UpdateSubMerchantRequest): Promise<void>;

  get callbackUrl(): string;
}
