import { BaseEvent } from '@common/interfaces';
import { APPOINTMENT_EVENTS } from '@src/domain/constants/events/appointment.constant';

/**
 * Toplu (bulk) randevu soft-delete işlemi tamamlandığında fırlatılır. Bulk işlem
 * domain entity'yi bypass ettiği için (N+1 önlemek adına `updateMany`), CLAUDE.md
 * kuralı gereği handler'dan **tek bir toplu event** olarak yayınlanır.
 *
 * Yan etkiler (ilgili hastalara bildirim + Redis temizliği) listener tarafından
 * kuyruğa (APPOINTMENT queue) devredilir; ağır/asenkron iş processor'da yapılır.
 */
export const AppointmentEventBulkScopes = {
  CLINIC: 'CLINIC',
  ORGANIZATION: 'ORGANIZATION',
} as const;
export type AppointmentEventBulkScope =
  (typeof AppointmentEventBulkScopes)[keyof typeof AppointmentEventBulkScopes];

export interface AppointmentsBulkSoftDeletedEventPayload {
  scope: AppointmentEventBulkScope;
  /** scope === 'CLINIC' iken dolu. */
  clinicId?: string;
  /** scope === 'ORGANIZATION' iken dolu. */
  organizationId?: string;
  /** Soft-delete'ten etkilenen randevu sayısı. */
  affectedCount: number;
}

export class AppointmentsBulkSoftDeletedEvent extends BaseEvent {
  static readonly NAME = APPOINTMENT_EVENTS.BULK_SOFT_DELETED;

  public readonly scope: AppointmentEventBulkScope;
  public readonly clinicId?: string;
  public readonly organizationId?: string;
  public readonly affectedCount: number;

  constructor(payload: AppointmentsBulkSoftDeletedEventPayload) {
    super();
    this.scope = payload.scope;
    this.clinicId = payload.clinicId;
    this.organizationId = payload.organizationId;
    this.affectedCount = payload.affectedCount;
  }
}
