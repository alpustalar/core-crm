import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentLinkModule } from '@src/infrastructure/payment/links/payment-link.module';
import { BookingPaymentIyzicoController } from './controllers/booking-payment-iyzico.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { BookingPaymentApplicationModule } from '@modules/crm/health-tourism/booking-payment/application/application.module';

@Module({
  imports: [CqrsModule, PaymentLinkModule, BookingPaymentApplicationModule],
  controllers: [BookingPaymentIyzicoController, StripeWebhookController],
})
export class BookingPaymentPresentationModule {}
