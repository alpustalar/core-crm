export const REDIS_KEYS = {
  CLINIC: {
    DEACTIVATED: (clinicId: string) => `clinic:deactivated:${clinicId}`,
    SETTINGS: (clinicId: string) => `clinic:settings:${clinicId}`,
  },
  USER: {
    BANNED: (userId: string) => `user:banned:${userId}`,
  },
  ORGANIZATION: {
    DEACTIVATED: (organizationId: string) =>
      `organization:deactivated:${organizationId}`,
  },
  META_ADS: {
    OAUTH_STATE: (state: string) => `meta-ads:oauth-state:${state}`,
  },
  AUTH: {
    ACTOR_CACHE: (userId: string) => `auth:actor-cache:${userId}`,
    TOKEN_BLOCKLIST: (tokenHash: string) => `auth:token-blocklist:${tokenHash}`,
  },
} as const;
