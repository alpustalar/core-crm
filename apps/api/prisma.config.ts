import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'src/infrastructure/persistence/prisma/schema.prisma',
  migrations: {
    path: 'src/infrastructure/persistence/prisma/migrations',
  },
});
