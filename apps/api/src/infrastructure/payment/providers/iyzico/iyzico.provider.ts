import { BadRequestException, Injectable } from '@nestjs/common';
import { IyzicoClient } from './iyzico.client';
import { getGlobalPrefix, ROUTE_PATHS } from '@common/constants';
import { ENV } from '@common/constants/env.constant';
import { ConfigService } from '@nestjs/config';
import Iyzipay from 'iyzipay';
import { IIyzicoProvider } from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import type { PaymentInitializeRequest } from '@src/infrastructure/payment/providers/iyzico/domain/types/payment-initialize.request';
import { RetrieveCheckoutFormResult } from '@src/infrastructure/payment/providers/iyzico/domain/types/retrieve-checkout-form.result';
import { CancelPaymentRequest } from '@src/infrastructure/payment/providers/iyzico/domain/types/cancel-payment.request';
import type {
  CreateSubMerchantRequest,
  SubMerchantResult,
  UpdateSubMerchantRequest,
} from '@src/infrastructure/payment/providers/iyzico/domain/types/create-submerchant.request';

@Injectable()
export class IyzicoProvider implements IIyzicoProvider {
  public readonly name = IyzicoProvider.name;
  constructor(
    private readonly client: IyzicoClient,
    private readonly configService: ConfigService
  ) {}

  get callbackUrl(): string {
    const origin = this.configService.get(ENV.ORIGIN) as string;
    const prefix = getGlobalPrefix();

    return `${origin}/${prefix}/${ROUTE_PATHS.PAYMENTS.IYZICO.FULL_CALLBACK_PATH}`;
  }

  async paymentInitialize(request: PaymentInitializeRequest) {
    return this.client.createCheckoutForm({
      callbackUrl: this.callbackUrl,
      ...request,
    });
  }

  async refund(data: Iyzipay.RefundRequestData) {
    return this.client.refundPayment(data);
  }

  async retrieveCheckoutForm(
    token: string
  ): Promise<RetrieveCheckoutFormResult> {
    const sdkResult = await this.client.retrieveCheckoutForm({ token });

    return {
      isSuccess: sdkResult.paymentStatus.toUpperCase() === 'SUCCESS',
      paymentId: sdkResult.paymentId,
      paymentTransactionId: sdkResult.paymentItems?.[0]?.paymentTransactionId,
      errorCode: sdkResult.errorCode,
      errorMessage: sdkResult.errorMessage,
      rawResponse: sdkResult as unknown,
    };
  }

  getInstallmentInfo({
    locale = 'TR',
    conversationId,
    price,
    binNumber,
  }: Iyzipay.InstallmentInfoRequestData) {
    return this.client.retrieveInstallmentInfo({
      locale,
      conversationId,
      price,
      binNumber,
    });
  }

  cancelPayment({ conversationId, paymentId, ip }: CancelPaymentRequest) {
    return this.client.createCancelPayment({
      locale: 'TR',
      conversationId,
      paymentId,
      ip,
    });
  }

  async createSubMerchant(request: CreateSubMerchantRequest): Promise<SubMerchantResult> {
    const result = await this.client.createSubMerchant({
      locale: 'TR',
      currency: 'TRY',
      ...request,
    });
    if ((result as any).status !== 'success') {
      throw new BadRequestException(
        (result as any).errorMessage ?? 'Alt üye işyeri oluşturulamadı.'
      );
    }
    return { subMerchantKey: (result as any).subMerchantKey };
  }

  async updateSubMerchant(request: UpdateSubMerchantRequest): Promise<void> {
    const result = await this.client.updateSubMerchant({
      locale: 'TR',
      currency: 'TRY',
      ...request,
    });
    if ((result as any).status !== 'success') {
      throw new BadRequestException(
        (result as any).errorMessage ?? 'Alt üye işyeri güncellenemedi.'
      );
    }
  }
}
