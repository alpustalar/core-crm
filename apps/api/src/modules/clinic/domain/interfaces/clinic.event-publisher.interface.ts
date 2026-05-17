import {
  ClinicCreatedEventPayload,
  ClinicSoftDeleteByOrganizationIdEventPayload,
} from '@modules/clinic/domain/events';

export const CLINIC_EVENT_PUBLISHER_TOKEN = Symbol('IClinicEventPublisher');

export interface IClinicEventPublisher {
  softDeleteClinicByOrganizationId(
    event: ClinicSoftDeleteByOrganizationIdEventPayload
  ): void;
  createClinic(event: ClinicCreatedEventPayload): void;
}
