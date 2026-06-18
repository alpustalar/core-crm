import { getGlobalPrefix } from '@common/constants';
import { ENV } from '@common/constants/env.constant';
import { ROUTE_PATHS } from '@common/constants/routes.constant';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IyzicoProvider } from '@src/infrastructure/payment/providers/iyzico/iyzico.provider';
import { randomUUID } from 'crypto';
import {
  IBillingAdapter,
  InitSubscriptionPaymentInput,
  PaymentResult,
} from './billing-adapter.interface';

const PLACEHOLDER_IDENTITY_NUMBER = '11111111111';

@Injectable()
export class IyzicoBillingAdapter implements IBillingAdapter {
  constructor(
    private readonly iyzicoProvider: IyzicoProvider,
    private readonly configService: ConfigService
  ) {}

  async initializePayment(
    input: InitSubscriptionPaymentInput
  ): Promise<{ checkoutUrl: string; conversationId: string }> {
    const conversationId = randomUUID();

    const formattedPrice = input.amount.toApiFormat();

    const address = {
      contactName: `${input.buyer.name} ${input.buyer.surname}`,
      city: input.buyer.city || 'Istanbul',
      country: 'Turkey',
      address: input.buyer.address || 'Turkiye',
    };

    const result = await this.iyzicoProvider.paymentInitialize({
      locale: 'TR',
      conversationId,
      price: formattedPrice,
      paidPrice: formattedPrice,
      currency: input.amount.currency,
      basketId: input.organizationId,
      paymentGroup: 'PRODUCT',
      enabledInstallments: [1, 2, 3, 6, 9, 12],
      buyer: {
        id: input.buyer.id,
        name: input.buyer.name,
        surname: input.buyer.surname,
        email: input.buyer.email,
        gsmNumber: input.buyer.gsmNumber,
        identityNumber: PLACEHOLDER_IDENTITY_NUMBER,
        registrationAddress: address.address,
        ip: input.buyer.ip,
        city: address.city,
        country: 'Turkey',
      },
      shippingAddress: address,
      billingAddress: address,
      basketItems: [
        {
          id: input.organizationId,
          name: input.label,
          category1: 'Abonelik',
          itemType: 'VIRTUAL',
          price: formattedPrice,
        },
      ],
    });

    return {
      checkoutUrl: result.paymentPageUrl!,
      conversationId,
    };
  }

  async handlePaymentResult(token: string): Promise<PaymentResult> {
    const result = await this.iyzicoProvider.retrieveCheckoutForm(token);

    return {
      success: result.isSuccess,
      iyzicoPaymentId: result.paymentId,
      errorMessage: result.errorMessage,
    };
  }

  async cancelPayment(iyzicoPaymentId: string, ip: string): Promise<void> {
    await this.iyzicoProvider.cancelPayment({
      conversationId: randomUUID(),
      paymentId: iyzicoPaymentId,
      ip,
    });
  }

  private buildCallbackUrl(): string {
    const origin = this.configService.get<string>(ENV.ORIGIN)!;
    const prefix = getGlobalPrefix();
    return `${origin}/${prefix}/${ROUTE_PATHS.SUBSCRIPTIONS.FULL_CALLBACK_PATH}`;
  }
}
