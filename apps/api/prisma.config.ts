import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: `envs/.env.${process.env.NODE_ENV ?? 'development'}` });

export default defineConfig({
  schema: 'src/infrastructure/persistence/prisma/schema',
  migrations: {
    path: 'src/infrastructure/persistence/prisma/migrations',
  },
});
