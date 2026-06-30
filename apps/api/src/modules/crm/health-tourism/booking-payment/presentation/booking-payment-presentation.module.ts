import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PaymentLinkModule } from '@src/infrastructure/payment/links/payment-link.module';
import { BookingPaymentCommandModule } from '../application/commands/command.module';
import { BookingPaymentIyzicoController } from './controllers/booking-payment-iyzico.controller';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';

@Module({
  imports: [CqrsModule, PaymentLinkModule, BookingPaymentCommandModule],
  controllers: [BookingPaymentIyzicoController, StripeWebhookController],
})
export class BookingPaymentPresentationModule {}
