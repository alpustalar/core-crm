import { Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/persistence/prisma/context/context.service';
import {
  PaymentPaidEvent,
  PaymentPaidEventParams,
} from '@modules/payment/domain/events/payment-paid.event';
import {
  PaymentRefundedEvent,
  PaymentRefundedEventParams,
} from '@modules/payment/domain/events/payment-refunded.event';
import {
  PaymentFailedEvent,
  PaymentFailedParams,
} from '@modules/payment/domain/events/payment-failed.event';
import {
  PaymentInitiatedEvent,
  PaymentInitiatedEventParams,
} from '@modules/payment/domain/events/payment-initiated.event';
import {
  PaymentCancelledEvent,
  PaymentCancelledEventParams,
} from '@modules/payment/domain/events/payment-cancelled.event';

@Injectable()
export class PaymentEventPublisher {
  constructor(private readonly contextService: ContextService) {}

  paymentPaid(payload: PaymentPaidEventParams) {
    this.contextService.addEvent(
      PaymentPaidEvent.name,
      new PaymentPaidEvent(payload)
    );
  }

  paymentRefund(payload: PaymentRefundedEventParams) {
    this.contextService.addEvent(
      PaymentRefundedEvent.name,
      new PaymentRefundedEvent(payload)
    );
  }
  paymentFailed(payload: PaymentFailedParams) {
    this.contextService.addEvent(
      PaymentFailedEvent.name,
      new PaymentFailedEvent(payload)
    );
  }

  paymentInitiated(payload: PaymentInitiatedEventParams) {
    this.contextService.addEvent(
      PaymentInitiatedEvent.name,
      new PaymentInitiatedEvent(payload)
    );
  }

  paymentCancelled(payload: PaymentCancelledEventParams) {
    this.contextService.addEvent(
      PaymentCancelledEvent.name,
      new PaymentCancelledEvent(payload)
    );
  }
}
