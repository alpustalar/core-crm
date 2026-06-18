import { z } from 'zod';
import CurrencySchema from '@shared/generated-zod/inputTypeSchemas/CurrencySchema';

export const TreatmentPackageItemInputSchema = z.object({
  treatmentId: z.uuid(),
  count: z.number().int().min(1),
});

export const CreateTreatmentPackageSchema = z.object({
  name: z.string().min(2).max(150),
  examinationCount: z.number().int().min(0),
  controlCount: z.number().int().min(0),
  validityDays: z.number().int().min(1),
  price: z.number().nonnegative(),
  providerIds: z.array(z.uuid()).optional(),
  items: z.array(TreatmentPackageItemInputSchema).optional(),
  currency: CurrencySchema,
});
