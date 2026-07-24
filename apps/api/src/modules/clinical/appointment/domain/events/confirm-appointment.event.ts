import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Randevu onaylandığında (personel `confirm`) entity tarafından fırlatılır.
 * Yan etkiler listener'da: hastaya "randevunuz onaylandı" bildirimi + audit.
 */
export interface AppointmentConfirmedEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  startTime: Date;
}

export class AppointmentConfirmedEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.CONFIRMED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;
  public readonly patientName: string;
  public readonly patientPhone: string;
  public readonly patientEmail: string | null;
  public readonly startTime: Date;

  constructor(payload: AppointmentConfirmedEventPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.patientId = payload.patientId;
    this.patientName = payload.patientName;
    this.patientPhone = payload.patientPhone;
    this.patientEmail = payload.patientEmail;
    this.startTime = payload.startTime;
  }
}
