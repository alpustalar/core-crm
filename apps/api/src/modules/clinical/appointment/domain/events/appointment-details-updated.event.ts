import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Randevu detayları (hasta iletişim / not / tedavi-muayene-ziyaret türü) personel
 * tarafından güncellendiğinde fırlatılır. Şu an tüketen listener yok (rescheduled/
 * confirmed gibi audit seam'i için hazır kanca); zaman/doktor/durum değişimi bu
 * event'e dahil DEĞİLDİR.
 */
export interface AppointmentDetailsUpdatedEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
}

export class AppointmentDetailsUpdatedEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.DETAILS_UPDATED;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;

  constructor(payload: AppointmentDetailsUpdatedEventPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.patientId = payload.patientId;
  }
}
