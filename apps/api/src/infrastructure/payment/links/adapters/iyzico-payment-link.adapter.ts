import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { getGlobalPrefix, ROUTE_PATHS } from '@common/constants';
import { ENV } from '@common/constants/env.constant';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import { PaymentInitializeRequest } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/types/payment-initialize.request';
import {
  CreatePaymentLinkInput,
  IPaymentLinkProvider,
  PaymentLinkProviderName,
  PaymentLinkResult,
  RefundPaymentLinkInput,
} from '../payment-link.port';

/**
 * iyzico CheckoutForm tabanlı ödeme linki (yurt içi müşteri — TRY). Mevcut IIyzicoProvider'ı
 * sarmalar ama callback'i sağlık-turizmi booking callback'ine yönlendirir (randevu callback'inden
 * ayrı). Tutar caller tarafından TRY'ye çevrilmiş gelir. Ödeme, callback → retrieveCheckoutForm
 * ile doğrulanır (BookingPaymentIyzicoController).
 */
@Injectable()
export class IyzicoPaymentLinkAdapter implements IPaymentLinkProvider {
  readonly provider: PaymentLinkProviderName = 'IYZICO';

  constructor(
    @Inject(IYZICO_PROVIDER)
    private readonly iyzico: IIyzicoProvider,
    private readonly config: ConfigService
  ) {}

  async createLink(input: CreatePaymentLinkInput): Promise<PaymentLinkResult> {
    // conversationId = bookingPaymentId → callback'te BookingPayment doğrudan bulunur.
    const conversationId = input.bookingPaymentId;

    const request: PaymentInitializeRequest = {
      locale: 'TR',
      conversationId,
      price: input.amount,
      paidPrice: input.amount,
      currency: 'TRY',
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl: this.bookingCallbackUrl(),
      buyer: {
        id: input.bookingPaymentId,
        name: input.buyer.name,
        surname: input.buyer.surname,
        gsmNumber: input.buyer.phone,
        email: input.buyer.email || 'no-reply@example.com',
        identityNumber: '11111111111',
        registrationAddress: 'Türkiye',
        ip: input.ip,
        city: 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: `${input.buyer.name} ${input.buyer.surname}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
      },
      billingAddress: {
        contactName: `${input.buyer.name} ${input.buyer.surname}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Türkiye',
      },
      basketItems: [
        {
          id: input.bookingPaymentId,
          name: input.description,
          category1: 'Sağlık Turizmi',
          itemType: 'VIRTUAL',
          price: input.amount,
        },
      ],
    };

    const result = await this.iyzico.paymentInitialize(request);
    if (!result.paymentPageUrl) {
      throw new Error(
        result.errorMessage ?? 'iyzico ödeme sayfası URL üretmedi.'
      );
    }

    return {
      provider: this.provider,
      sessionId: conversationId,
      token: result.token,
      url: result.paymentPageUrl,
    };
  }

  /** iyzico CheckoutForm'un explicit expire API'si yok; ödenmezse kullanılmaz. */
  async expireLink(): Promise<void> {
    return;
  }

  async refund(input: RefundPaymentLinkInput): Promise<void> {
    await this.iyzico.refund({
      locale: 'TR',
      conversationId: randomUUID(),
      paymentTransactionId: input.providerRef,
      price: String(input.amount),
      ip: input.ip ?? '127.0.0.1',
      currency: 'TRY',
    });
  }

  private bookingCallbackUrl(): string {
    const origin = this.config.get<string>(ENV.ORIGIN) ?? '';
    const prefix = getGlobalPrefix();
    return `${origin}/${prefix}/${ROUTE_PATHS.BOOKING_PAYMENTS.IYZICO_FULL_CALLBACK_PATH}`;
  }
}
