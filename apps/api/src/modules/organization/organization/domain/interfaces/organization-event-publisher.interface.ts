import {
  OrganizationDeletionRequestedEventPayload,
  OrganizationSoftDeleteEventPayload,
} from '@modules/organization/organization/domain/events';

export const ORGANIZATION_EVENT_PUBLISHER = Symbol(
  'IOrganizationEventPublisher'
);

export interface IOrganizationEventPublisher {
  softDeleteOrganization(payload: OrganizationSoftDeleteEventPayload): void;
  deletionRequested(payload: OrganizationDeletionRequestedEventPayload): void;
}
