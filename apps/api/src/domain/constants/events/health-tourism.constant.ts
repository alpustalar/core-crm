export const HEALTH_TOURISM_CONFIG_EVENTS = {
  CONFIG: 'health-tourism-config',
} as const;

export type HealthTourismConfigEvent =
  (typeof HEALTH_TOURISM_CONFIG_EVENTS)[keyof typeof HEALTH_TOURISM_CONFIG_EVENTS];
