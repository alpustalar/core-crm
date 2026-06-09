import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

export interface AppointmentCancellationRequestedPayload {
  appointmentId: string;
  clinicId: string;
  patientId: string | null;
  patientName: string;
  startTime: Date;
  cancelReason?: string;
}

export class AppointmentCancellationRequestedEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.CANCELLATION_REQUESTED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly patientId: string | null;
  public readonly patientName: string;
  public readonly startTime: Date;
  public readonly cancelReason?: string;

  constructor(payload: AppointmentCancellationRequestedPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.patientId = payload.patientId;
    this.patientName = payload.patientName;
    this.startTime = payload.startTime;
    this.cancelReason = payload.cancelReason;
  }
}
