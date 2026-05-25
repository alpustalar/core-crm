export const THROTTLE_CONFIG = {
  SENSITIVE_ENDPOINT: { default: { limit: 3, ttl: 60 * 1000 } },
  EMAIL_CHECK: { default: { limit: 5, ttl: 60 * 1000 } },
  AUTH_ENDPOINT: { default: { limit: 5, ttl: 60 * 1000 } },
};
