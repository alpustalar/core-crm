import { z } from 'zod';
import { PaginationSchema } from '@shared/common';

export const GetProviderCalendarSchema = z.object({
  providerId: z.uuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
