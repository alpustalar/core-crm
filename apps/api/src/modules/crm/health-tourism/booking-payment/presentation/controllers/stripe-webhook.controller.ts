import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import Stripe from 'stripe';
import { Public } from '@common/decorators/public.decorator';
import { ROUTE_PATHS, THROTTLE_CONFIG } from '@common/constants';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { StripeClientFactory } from '@src/infrastructure/payment/links/adapters/stripe-client.factory';
import { ConfirmBookingPaymentCommand } from '@modules/crm/health-tourism/booking-payment/application/commands/confirm-booking-payment/confirm-booking-payment.command';
import { ExecutionContextFactory } from '@src/domain/common/execution/execution-context.factory';
import { BookingPaymentProviderSchema } from '@shared';

/**
 * Stripe webhook — sağlık turizmi (otel/transfer) ödemesinin yurt dışı (EUR/USD) bacağı.
 * İmza ham gövde (rawBody, main.ts `rawBody:true`) ve `stripe-signature` header'ı ile doğrulanır.
 * `checkout.session.completed` → ConfirmBookingPaymentCommand (book replay).
 */
@Controller(ROUTE_PATHS.BOOKING_PAYMENTS.STRIPE_ROOT)
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly stripe: StripeClientFactory
  ) {}

  @Post(ROUTE_PATHS.BOOKING_PAYMENTS.WEBHOOK)
  @Public()
  @Throttle(THROTTLE_CONFIG.SENSITIVE_ENDPOINT)
  @HttpCode(HttpStatus.OK)
  async handle(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: true }> {
    if (!req.rawBody || !signature) {
      throw new BadRequestException('Geçersiz Stripe webhook isteği.');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.constructEvent(req.rawBody, signature);
    } catch (err) {
      this.logger.warn(
        `Stripe imza doğrulaması başarısız: ${
          err instanceof Error ? err.message : err
        }`
      );
      throw new BadRequestException('Stripe imza doğrulaması başarısız.');
    }

    if (event.type === 'checkout.session.completed') {
      await this.onCheckoutCompleted(event.data.object);
    }

    return { received: true };
  }

  private async onCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    if (session.payment_status !== 'paid') return;

    const bookingPaymentId = session.metadata?.bookingPaymentId;
    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!bookingPaymentId || !paymentIntent) {
      this.logger.warn(
        `Stripe session eksik metadata (session=${session.id}); atlandı.`
      );
      return;
    }

    await this.commandBus.execute(
      new ConfirmBookingPaymentCommand({
        bookingPaymentId,
        provider: BookingPaymentProviderSchema.enum.STRIPE,
        providerRef: paymentIntent,
        ctx: ExecutionContextFactory.createInternal(),
      })
    );
  }
}
