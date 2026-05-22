import { CancelAppointmentPayload } from '@modules/appointment/domain/events/cancel-appointment.event';

export const APPOINTMENT_EVENT_PUBLISHER = Symbol('IAppointmentEventPublisher');

export interface IAppointmentEventPublisher {
  cancelAppointment(payload: CancelAppointmentPayload): void;
}
