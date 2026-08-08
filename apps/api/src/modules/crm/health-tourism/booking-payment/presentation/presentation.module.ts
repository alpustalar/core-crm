import { Module } from '@nestjs/common';
import { PaymentLinkModule } from '@src/infrastructure/payment/links/payment-link.module';
import { BookingPaymentIyzicoController } from '@modules/crm/health-tourism/booking-payment/presentation/http/controllers/booking-payment-iyzico.controller';
import { StripeWebhookController } from '@modules/crm/health-tourism/booking-payment/presentation/http/controllers/stripe-webhook.controller';

@Module({
  imports: [PaymentLinkModule],
  controllers: [BookingPaymentIyzicoController, StripeWebhookController],
})
export class BookingPaymentPresentationModule {}
