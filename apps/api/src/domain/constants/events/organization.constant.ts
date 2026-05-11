export const ORGANIZATION_EVENTS = {
  CREATED: 'organization.created',
  UPDATED: 'organization.updated',
  SOFT_DELETED: 'organization.deleted',
  ACTIVATED: 'organization.activated',
  DEACTIVATED: 'organization.deactivated',
} as const;

export type OrganizationEvent =
  (typeof ORGANIZATION_EVENTS)[keyof typeof ORGANIZATION_EVENTS];
