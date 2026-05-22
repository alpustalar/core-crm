import { Inject, Injectable } from '@nestjs/common';
import {
  PaymentPaidEvent,
  PaymentPaidEventPayload,
} from '@modules/payment/domain/events/payment-paid.event';
import {
  PaymentRefundedEvent,
  PaymentRefundedEventPayload,
} from '@modules/payment/domain/events/payment-refunded.event';
import {
  PaymentFailedEvent,
  PaymentFailedPayload,
} from '@modules/payment/domain/events/payment-failed.event';
import {
  PaymentInitiatedEvent,
  PaymentInitiatedEventPayload,
} from '@modules/payment/domain/events/payment-initiated.event';
import {
  PaymentCancelledEvent,
  PaymentCancelledEventPayload,
} from '@modules/payment/domain/events/payment-cancelled.event';
import { IPaymentEventPublisher } from '@modules/payment/domain/interfaces/payment-event-publisher.interface';
import {
  CONTEXT_SERVICE,
  IContextService,
} from '@src/infrastructure/context/domain/interfaces/context.service.interface';

@Injectable()
export class PaymentEventPublisher implements IPaymentEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: IContextService
  ) {}

  paymentPaid(payload: PaymentPaidEventPayload) {
    this.contextService.addEvent(new PaymentPaidEvent(payload));
  }

  paymentRefund(payload: PaymentRefundedEventPayload) {
    this.contextService.addEvent(new PaymentRefundedEvent(payload));
  }
  paymentFailed(payload: PaymentFailedPayload) {
    this.contextService.addEvent(new PaymentFailedEvent(payload));
  }

  paymentInitiated(payload: PaymentInitiatedEventPayload) {
    this.contextService.addEvent(new PaymentInitiatedEvent(payload));
  }

  paymentCancelled(payload: PaymentCancelledEventPayload) {
    this.contextService.addEvent(new PaymentCancelledEvent(payload));
  }
}
