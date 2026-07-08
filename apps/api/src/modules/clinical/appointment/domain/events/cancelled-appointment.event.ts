import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Randevu iptal edildiğinde (personel `cancelSchedule` veya hasta `cancelBooking`)
 * entity tarafından fırlatılır. Yan etkiler listener'da işlenir:
 *  - Sağlık turizmi rezervasyonu varsa iade (refund) tetikleme (seam).
 *  - Hastaya iptal bildirimi (mail/mesaj).
 *  - Audit log.
 */
export interface AppointmentCancelledEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  startTime: Date;
  canceledBy: string;
  cancelReason?: string;
}

export class AppointmentCancelledEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.CANCELLED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;
  public readonly patientName: string;
  public readonly patientPhone: string;
  public readonly patientEmail: string | null;
  public readonly startTime: Date;
  public readonly canceledBy: string;
  public readonly cancelReason?: string;

  constructor(payload: AppointmentCancelledEventPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.patientId = payload.patientId;
    this.patientName = payload.patientName;
    this.patientPhone = payload.patientPhone;
    this.patientEmail = payload.patientEmail;
    this.startTime = payload.startTime;
    this.canceledBy = payload.canceledBy;
    this.cancelReason = payload.cancelReason;
  }
}
