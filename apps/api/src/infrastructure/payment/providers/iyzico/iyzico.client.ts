/* eslint-disable */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from '@common/constants/env.constant';
import Iyzipay from 'iyzipay';
import { promisify } from 'node:util';
import { WithIyzicoError } from '@src/infrastructure/payment/providers/iyzico/domain/types/with-iyzico-error.type';
import { CreateCheckoutFormRequest } from '@src/infrastructure/payment/providers/iyzico/domain/types/create-checkout-form.request';
import {
  CreateSubMerchantRequest,
  SubMerchantResult,
  UpdateSubMerchantRequest,
} from '@src/infrastructure/payment/providers/iyzico/domain/types/create-submerchant.request';

@Injectable()
export class IyzicoClient {
  readonly createCheckoutForm: (
    request: CreateCheckoutFormRequest
  ) => Promise<
    WithIyzicoError<
      Iyzipay.CheckoutFormInitialResult & { paymentPageUrl?: string }
    >
  >;
  readonly retrieveCheckoutForm: (
    request: Iyzipay.CheckoutFormRetrieveRequestData
  ) => Promise<WithIyzicoError<Iyzipay.CheckoutFormRetrieveResult>>;
  readonly createCancelPayment: (
    request: Iyzipay.CancelPaymentRequestData
  ) => Promise<WithIyzicoError<Iyzipay.CancelPaymentResult>>;
  readonly retrieveInstallmentInfo: (
    request: Iyzipay.InstallmentInfoRequestData
  ) => Promise<WithIyzicoError<Iyzipay.InstallmentInfoResult>>;
  readonly refundPayment: (
    request: Iyzipay.RefundRequestData
  ) => Promise<WithIyzicoError<Iyzipay.RefundResult>>;
  readonly createSubMerchant: (
    request: CreateSubMerchantRequest & { locale?: string; currency?: string }
  ) => Promise<WithIyzicoError<SubMerchantResult>>;
  readonly updateSubMerchant: (
    request: UpdateSubMerchantRequest & { locale?: string; currency?: string }
  ) => Promise<WithIyzicoError<SubMerchantResult>>;

  constructor(config: ConfigService) {
    const iyzipay = new Iyzipay({
      apiKey: config.get(ENV.IYZICO_API_KEY) as string,
      secretKey: config.get(ENV.IYZICO_SECRET_KEY) as string,
      uri: config.get(ENV.IYZICO_BASE_URL) as string,
    });

    this.createCheckoutForm = promisify(
      iyzipay.checkoutFormInitialize.create as any
    ).bind(iyzipay.checkoutFormInitialize);
    this.retrieveCheckoutForm = promisify(iyzipay.checkoutForm.retrieve).bind(
      iyzipay.checkoutForm
    );
    this.createCancelPayment = promisify(iyzipay.cancel.create).bind(
      iyzipay.cancel
    );
    this.refundPayment = promisify(iyzipay.refund.create).bind(iyzipay.refund);
    this.retrieveInstallmentInfo = promisify(
      iyzipay.installmentInfo.retrieve
    ).bind(iyzipay.installmentInfo);
    this.createSubMerchant = promisify(iyzipay.subMerchant.create).bind(
      iyzipay.subMerchant
    );
    this.updateSubMerchant = promisify(iyzipay.subMerchant.update).bind(
      iyzipay.subMerchant
    );
  }
}
