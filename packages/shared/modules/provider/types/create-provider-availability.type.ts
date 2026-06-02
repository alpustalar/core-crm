import { z } from 'zod';
import { CreateProviderAvailabilitySchema } from '../schemas';

export type CreateProviderAvailability = z.infer<
  typeof CreateProviderAvailabilitySchema
>;
