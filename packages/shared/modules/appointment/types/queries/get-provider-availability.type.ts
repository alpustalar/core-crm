import { GetProviderAvailabilitySchema } from '@shared/modules/appointment/schemas/queries/get-provider-availability.schema';
import { z } from 'zod';

export type GetProviderAvailability = z.infer<
  typeof GetProviderAvailabilitySchema
>;
