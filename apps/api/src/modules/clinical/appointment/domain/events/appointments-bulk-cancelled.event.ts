import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Doktor-günü toplu iptal (rapor/izin/acil) tamamlandığında fırlatılır. Bulk işlem
 * domain entity'yi bypass ettiği için (N+1 önlemek adına `updateMany`), CLAUDE.md
 * kuralı gereği handler'dan **tek bir toplu event** olarak yayınlanır. İlgili
 * hastalara bildirim yan etkisi listener'da (SEAM) işlenir.
 */
export interface AppointmentsBulkCancelledEventPayload {
  clinicId: string;
  providerId: string;
  startDate: Date;
  endDate: Date;
  /** İptal edilen randevu sayısı. */
  affectedCount: number;
  canceledBy: string;
  cancelReason?: string;
}

export class AppointmentsBulkCancelledEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.BULK_CANCELLED;

  public readonly clinicId: string;
  public readonly providerId: string;
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly affectedCount: number;
  public readonly canceledBy: string;
  public readonly cancelReason?: string;

  constructor(payload: AppointmentsBulkCancelledEventPayload) {
    super();
    this.clinicId = payload.clinicId;
    this.providerId = payload.providerId;
    this.startDate = payload.startDate;
    this.endDate = payload.endDate;
    this.affectedCount = payload.affectedCount;
    this.canceledBy = payload.canceledBy;
    this.cancelReason = payload.cancelReason;
  }
}
