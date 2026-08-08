import { Inject, Injectable } from '@nestjs/common';
import { ContextService } from '@src/infrastructure/context/context.service';
import {
  AppointmentCancellationRequestedEvent,
  AppointmentCancellationRequestedPayload,
} from '@modules/clinical/appointment/domain/events/appointment-cancellation-requested.event';
import {
  AppointmentsBulkSoftDeletedEvent,
  AppointmentsBulkSoftDeletedEventPayload,
} from '@modules/clinical/appointment/domain/events/appointments-bulk-soft-deleted.event';
import {
  AppointmentsBulkCancelledEvent,
  AppointmentsBulkCancelledEventPayload,
} from '@modules/clinical/appointment/domain/events/appointments-bulk-cancelled.event';
import { IAppointmentEventPublisher } from '@modules/clinical/appointment/domain/interfaces/appointment-event-publisher.interface';
import { CONTEXT_SERVICE } from '@src/infrastructure/context/context.service.interface';

@Injectable()
export class AppointmentEventPublisher implements IAppointmentEventPublisher {
  constructor(
    @Inject(CONTEXT_SERVICE)
    private readonly contextService: ContextService
  ) {}

  cancellationRequested(payload: AppointmentCancellationRequestedPayload) {
    this.contextService.addEvent(
      new AppointmentCancellationRequestedEvent(payload)
    );
  }

  bulkSoftDeleted(payload: AppointmentsBulkSoftDeletedEventPayload) {
    this.contextService.addEvent(new AppointmentsBulkSoftDeletedEvent(payload));
  }

  bulkCancelled(payload: AppointmentsBulkCancelledEventPayload) {
    this.contextService.addEvent(new AppointmentsBulkCancelledEvent(payload));
  }
}
