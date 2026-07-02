import { Module } from '@nestjs/common';
import { IyzicoModule } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/iyzico.module';
import { IYZICO_PAYMENT_LINK, STRIPE_PAYMENT_LINK } from './payment-link.port';
import { FX_RATE_PROVIDER } from './fx-rate.port';
import { IyzicoPaymentLinkAdapter } from './adapters/iyzico-payment-link.adapter';
import { StripePaymentLinkAdapter } from './adapters/stripe-payment-link.adapter';
import { StripeClientFactory } from './adapters/stripe-client.factory';
import { StaticEnvFxRateProvider } from './adapters/static-env-fx-rate.provider';
import { TcmbFxRateProvider } from './adapters/tcmb-fx-rate.provider';

/**
 * Sağlayıcı-bağımsız ödeme linki altyapısı: iyzico (TRY) + Stripe (EUR/USD) adapter'ları,
 * FX kuru ve Stripe istemci factory'si. Sağlık turizmi tahsilat (booking-payment) modülü
 * token'lar üzerinden tüketir; webhook controller'ı StripeClientFactory'yi imza doğrulama için kullanır.
 */
@Module({
  imports: [IyzicoModule],
  providers: [
    StripeClientFactory,
    { provide: IYZICO_PAYMENT_LINK, useClass: IyzicoPaymentLinkAdapter },
    { provide: STRIPE_PAYMENT_LINK, useClass: StripePaymentLinkAdapter },
    // TCMB işlem-tarihli kur (statutory); çözülemezse StaticEnv fallback'e düşer.
    StaticEnvFxRateProvider,
    { provide: FX_RATE_PROVIDER, useClass: TcmbFxRateProvider },
  ],
  exports: [
    StripeClientFactory,
    IYZICO_PAYMENT_LINK,
    STRIPE_PAYMENT_LINK,
    FX_RATE_PROVIDER,
  ],
})
export class PaymentLinkModule {}
