import { CancelAppointmentPayload } from '@modules/clinical/appointment/domain/events/cancel-appointment.event';
import { AppointmentCancellationRequestedPayload } from '@modules/clinical/appointment/domain/events/appointment-cancellation-requested.event';

export const APPOINTMENT_EVENT_PUBLISHER = Symbol('IAppointmentEventPublisher');

export interface IAppointmentEventPublisher {
  cancelAppointment(payload: CancelAppointmentPayload): void;
  cancellationRequested(payload: AppointmentCancellationRequestedPayload): void;
}
