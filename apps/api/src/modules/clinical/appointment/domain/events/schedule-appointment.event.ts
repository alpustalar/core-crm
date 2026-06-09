import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

export interface AppointmentScheduledEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  startTime: Date;
  endTime: Date;
}

export class AppointmentScheduledEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.SCHEDULED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;
  public readonly startTime: Date;
  public readonly endTime: Date;

  constructor(payload: AppointmentScheduledEventPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.patientId = payload.patientId;
    this.startTime = payload.startTime;
    this.endTime = payload.endTime;
  }
}
