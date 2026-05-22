import { Module } from '@nestjs/common';
import { PAYMENT_EVENT_PUBLISHER } from '@modules/payment/domain/interfaces/payment-event-publisher.interface';
import { PaymentEventPublisher } from '@modules/payment/infrastructure/events/payment-event-publisher.service';

@Module({
  providers: [
    {
      provide: PAYMENT_EVENT_PUBLISHER,
      useClass: PaymentEventPublisher,
    },
  ],
  exports: [PAYMENT_EVENT_PUBLISHER],
})
export class PaymentEventModule {}
