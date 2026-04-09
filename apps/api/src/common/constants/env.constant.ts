export const ENV = {
  PORT: 'PORT',
  DATABASE_URL: 'DATABASE_URL',
  MONGODB_URI: 'MONGODB_URI',
  REDIS_URL: 'REDIS_URL',
  ADMIN_EMAIL: 'ADMIN_EMAIL',
  BETTERSTACK_TOKEN: 'BETTERSTACK_TOKEN',
} as const;

export type EnvConstant = (typeof ENV)[keyof typeof ENV];
