import { Module } from '@nestjs/common';
import { PAYMENT_EVENT_PUBLISHER } from '@modules/finance/pos/virtual/domain/interfaces/payment-event-publisher.interface';
import { PaymentEventPublisher } from '@modules/finance/pos/virtual/infrastructure/events/payment-event-publisher.service';

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
