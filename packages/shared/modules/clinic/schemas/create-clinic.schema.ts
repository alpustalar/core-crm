import { GlobalStatusSchema } from '@shared/generated-zod';
import { z } from 'zod';

export const CreateClinicSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().optional(),
  email: z.email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: GlobalStatusSchema.optional(),
  timezone: z.string().optional(),
  logo: z.url().optional(),
  organizationId: z.uuid().optional(),
  sectorId: z.uuid({ error: 'Sektör Id zorunludur' }),
  consultationSlotDuration: z.number().default(15),
});
