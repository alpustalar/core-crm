export const PROVIDER_EVENTS = {
  CREATED: 'provider.created',
  UPDATED: 'provider.updated',
  SOFT_DELETED: 'provider.soft-deleted',
  DEACTIVATED: 'provider.deactivated',
  ACTIVATED: 'provider.activated',
  EXAMINATION_SET: 'provider.examination-set',
  AVAILABILITY_CREATED: 'provider.availability-created',
  OPERATION_MODE_SET: 'provider.operation-mode-set',
  SHIFT_CREATED: 'provider.shift-created',
} as const;

export type ProviderEvent =
  (typeof PROVIDER_EVENTS)[keyof typeof PROVIDER_EVENTS];
