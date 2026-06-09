import { ClinicSoftDeleteByOrganizationIdEventPayload } from '@modules/organization/clinic/domain/events';
import { ClinicSoftDeletedEventPayload } from '@modules/organization/clinic/domain/events/clinic-soft-deleted.event';
import { ClinicSoftDeleteRequestedEventPayload } from '@modules/organization/clinic/domain/events/clinic-soft-delete-requested.event';

export const CLINIC_EVENT_PUBLISHER = Symbol('IClinicEventPublisher');

export interface IClinicEventPublisher {
  softDeleteClinic(payload: ClinicSoftDeletedEventPayload): void;
  requestClinicSoftDelete(payload: ClinicSoftDeleteRequestedEventPayload): void;
  softDeleteClinicByOrganizationId(
    payload: ClinicSoftDeleteByOrganizationIdEventPayload
  ): void;
}
