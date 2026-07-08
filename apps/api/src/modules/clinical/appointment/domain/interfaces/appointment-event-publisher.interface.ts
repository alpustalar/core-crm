import { AppointmentCancellationRequestedPayload } from '@modules/clinical/appointment/domain/events/appointment-cancellation-requested.event';
import { AppointmentsBulkSoftDeletedEventPayload } from '@modules/clinical/appointment/domain/events/appointments-bulk-soft-deleted.event';

export const APPOINTMENT_EVENT_PUBLISHER = Symbol('IAppointmentEventPublisher');

export interface IAppointmentEventPublisher {
  cancellationRequested(payload: AppointmentCancellationRequestedPayload): void;
  bulkSoftDeleted(payload: AppointmentsBulkSoftDeletedEventPayload): void;
}
