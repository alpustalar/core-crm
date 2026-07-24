import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Randevu yeniden zamanlandığında (personel `reschedule` veya hasta
 * `rescheduleByPatient`) entity tarafından fırlatılır. Yan etkiler listener'da:
 * hastaya "randevunuz X tarihine alındı" bildirimi + audit.
 */
export interface AppointmentRescheduledEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  startTime: Date; // yeni başlangıç zamanı
}

export class AppointmentRescheduledEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.RESCHEDULED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;
  public readonly patientName: string;
  public readonly patientPhone: string;
  public readonly patientEmail: string | null;
  public readonly startTime: Date;

  constructor(payload: AppointmentRescheduledEventPayload) {
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
