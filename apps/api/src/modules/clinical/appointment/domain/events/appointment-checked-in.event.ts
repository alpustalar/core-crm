import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Hasta kliniğe geldiğinde (check-in / ARRIVED) fırlatılır. Bekleme odası ekranının
 * canlı güncellenmesi ve sıra yönetimi gibi yan etkiler için kanca (şu an SEAM).
 */
export interface AppointmentCheckedInEventPayload {
  appointmentId: string;
  clinicId: string;
  providerId: string;
  patientId: string | null;
  checkedInAt: Date;
}

export class AppointmentCheckedInEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.CHECKED_IN;

  public readonly appointmentId: string;
  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly patientId: string | null;
  public readonly checkedInAt: Date;

  constructor(payload: AppointmentCheckedInEventPayload) {
    super();
    this.appointmentId = payload.appointmentId;
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.patientId = payload.patientId;
    this.checkedInAt = payload.checkedInAt;
  }
}
