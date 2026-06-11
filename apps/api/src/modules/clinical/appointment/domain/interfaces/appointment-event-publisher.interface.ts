import { AppointmentCancellationRequestedPayload } from '@modules/clinical/appointment/domain/events/appointment-cancellation-requested.event';

export const APPOINTMENT_EVENT_PUBLISHER = Symbol('IAppointmentEventPublisher');

export interface IAppointmentEventPublisher {
  cancellationRequested(payload: AppointmentCancellationRequestedPayload): void;
}
