import {z} from 'zod';
export const ProviderIdentitySchema = z
  .object({
    providerId: z.uuid(),
    clinicId: z.uuid(),
  })