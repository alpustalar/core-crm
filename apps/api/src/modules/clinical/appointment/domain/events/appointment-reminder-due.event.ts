import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Yaklaşan (onaylı) bir randevu, kliniğin `sendSmsReminderHours` penceresine
 * girip henüz hatırlatma gönderilmemişken entity tarafından fırlatılır. Yan etki
 * listener'da: hastaya dış kanaldan (WhatsApp template / e-posta) hatırlatma.
 */
export interface AppointmentReminderDueEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  patientName: string;
  patientPhone: string;
  patientEmail: string | null;
  startTime: Date;
  /** Hatırlatmaya hasta yanıtı (iki yönlü onay) bekleniyor mu? */
  requireResponse: boolean;
}

export class AppointmentReminderDueEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.REMINDER_DUE;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;
  public readonly patientName: string;
  public readonly patientPhone: string;
  public readonly patientEmail: string | null;
  public readonly startTime: Date;
  public readonly requireResponse: boolean;

  constructor(payload: AppointmentReminderDueEventPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.patientId = payload.patientId;
    this.patientName = payload.patientName;
    this.patientPhone = payload.patientPhone;
    this.patientEmail = payload.patientEmail;
    this.startTime = payload.startTime;
    this.requireResponse = payload.requireResponse;
  }
}
