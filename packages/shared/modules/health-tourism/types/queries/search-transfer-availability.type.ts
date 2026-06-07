import { z } from 'zod';
import { SearchTransferAvailabilitySchema } from '../../schemas/queries/search-transfer-availability.schema';

export type SearchTransferAvailability = z.infer<
  typeof SearchTransferAvailabilitySchema
>;
