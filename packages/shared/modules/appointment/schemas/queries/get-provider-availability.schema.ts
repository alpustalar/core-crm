import { z } from 'zod';

export const GetProviderAvailabilitySchema = z.object({
  providerId: z.uuid(),
  clinicId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
