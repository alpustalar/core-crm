import {
  ClinicSoftDeleteByOrganizationIdEventParams,
  IClinicCreatedEvent,
} from '@modules/clinic/domain/events';

export const CLINIC_EVENT_PUBLISHER_TOKEN = Symbol('IClinicEventPublisher');

export interface IClinicEventPublisher {
  softDeleteClinicByOrganizationId(
    event: ClinicSoftDeleteByOrganizationIdEventParams
  ): void;
  createClinic(event: IClinicCreatedEvent): void;
}
