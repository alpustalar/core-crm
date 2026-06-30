import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { ENV } from '@common/constants/env.constant';

/**
 * Stripe SDK istemcisini env'den lazy (tembel) kurar — anahtar tanımlı değilse uygulama
 * başlangıçta patlamaz, yalnız ilk kullanımda anlamlı hata fırlatır. Hem ödeme-linki adapter'ı
 * hem webhook controller'ı bu factory üzerinden istemciye ve imza doğrulamaya erişir.
 */
@Injectable()
export class StripeClientFactory {
  private client: Stripe | null = null;

  constructor(private readonly config: ConfigService) {}

  get(): Stripe {
    if (this.client) return this.client;
    const key = this.config.get<string>(ENV.STRIPE_SECRET_KEY);
    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY tanımlı değil — Stripe ödeme linki üretilemez.'
      );
    }
    this.client = new Stripe(key);
    return this.client;
  }

  /** Webhook imzasını doğrular ve tipli Stripe.Event döner. */
  constructEvent(payload: Buffer | string, signature: string): Stripe.Event {
    const secret = this.config.get<string>(ENV.STRIPE_WEBHOOK_SECRET);
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET tanımlı değil.');
    }
    return this.get().webhooks.constructEvent(payload, signature, secret);
  }
}
