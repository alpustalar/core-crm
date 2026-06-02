import { z } from 'zod';

export const GlobalStatusSchema = z.enum([
  'ACTIVE',
  'DELETED',
  'SUSPENDED',
  'TRIAL',
]);
