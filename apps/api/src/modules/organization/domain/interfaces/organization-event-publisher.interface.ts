import { OrganizationSoftDeleteEventPayload } from '@modules/organization/domain/events';

export const ORGANIZATION_EVENT_PUBLISHER = Symbol(
  'IOrganizationEventPublisher'
);

export interface IOrganizationEventPublisher {
  softDeleteOrganization(payload: OrganizationSoftDeleteEventPayload): void;
}
