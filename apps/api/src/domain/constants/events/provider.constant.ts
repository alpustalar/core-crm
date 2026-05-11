export const PROVIDER_EVENTS = {
  CREATED: 'doctor.created',
  UPDATED: 'doctor.updated',
  DEACTIVATED: 'doctor.deactivated',
} as const;

export type ProviderEvent =
  (typeof PROVIDER_EVENTS)[keyof typeof PROVIDER_EVENTS];
