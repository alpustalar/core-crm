import { IAuditLog } from '@common/interfaces/audit-log.interface';
import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

export interface AppointmentCompletedEventPayload extends IAuditLog {
  appointmentId: string;
  clinicId: string;
  patientId: string | null;
  providerId: string;
}

export class AppointmentCompletedEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.COMPLETED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly patientId: string | null;
  public readonly providerId: string;

  constructor(payload: AppointmentCompletedEventPayload) {
    super(payload);
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.patientId = payload.patientId;
    this.providerId = payload.providerId;
  }
}
