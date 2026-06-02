import { z } from 'zod';

export const UpdateProviderInfoSchema = z.object({
  providerTitleId: z.uuid().optional(),
  providerSpecialtyId: z.uuid().optional(),
  sectorId: z.uuid().optional(),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: 'Geçersiz e-posta formatı' }).optional(),
});
