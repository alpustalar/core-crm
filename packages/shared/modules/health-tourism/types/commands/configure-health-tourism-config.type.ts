import { z } from 'zod';
import { ConfigureHealthTourismConfigSchema } from '../../schemas/commands';

export type ConfigureHealthTourismConfig = z.infer<
  typeof ConfigureHealthTourismConfigSchema
>;
