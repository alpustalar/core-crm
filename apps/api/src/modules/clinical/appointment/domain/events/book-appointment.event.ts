import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

export interface AppointmentBookedEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  startTime: Date;
  endTime: Date;
}

export class AppointmentBookedEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.BOOKED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;
  public readonly startTime: Date;
  public readonly endTime: Date;

  constructor(payload: AppointmentBookedEventPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.patientId = payload.patientId;
    this.startTime = payload.startTime;
    this.endTime = payload.endTime;
  }
}
