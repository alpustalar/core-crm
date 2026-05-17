import { Injectable } from '@nestjs/common';
import { CheckoutFormInitializeRequest, IyzicoClient } from './iyzico.client';
import { getGlobalPrefix, ROUTE_PATHS } from '@common/constants';
import { ENV } from '@common/constants/env.constant';
import { ConfigService } from '@nestjs/config';
import Iyzipay from 'iyzipay';
import { LedgerSource } from '@prisma/client';
import { CancelPaymentInput, IIyzicoProvider, RetrieveCheckoutFormResult } from './iyzico.provider.interface';

@Injectable()
export class IyzicoProvider implements IIyzicoProvider {
  public readonly name = LedgerSource.IYZICO;
  constructor(
    private readonly client: IyzicoClient,
    private readonly configService: ConfigService
  ) {}

  async paymentInitialize(request: CheckoutFormInitializeRequest) {
    return this.client.createCheckoutForm(request);
  }

  async refund(data: Iyzipay.RefundRequestData) {
    return this.client.refundPayment(data);
  }
  async retrieveCheckoutForm(token: string): Promise<RetrieveCheckoutFormResult> {
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

  cancelPayment({ conversationId, paymentId, ip }: CancelPaymentInput) {
    return this.client.createCancelPayment({
      locale: 'TR',
      conversationId,
      paymentId,
      ip,
    });
  }

  getCallbackUrl(): string {
    const origin = this.configService.get(ENV.ORIGIN) as string;
    const prefix = getGlobalPrefix();

    return `${origin}/${prefix}/${ROUTE_PATHS.PAYMENTS.IYZICO.FULL_CALLBACK_PATH}`;
  }
}
