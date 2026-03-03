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
} as const;
