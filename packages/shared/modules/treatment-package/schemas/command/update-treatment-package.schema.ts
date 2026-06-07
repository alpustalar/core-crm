import { z } from 'zod';
import { TreatmentPackageItemInputSchema } from './create-treatment-package.schema';

export const UpdateTreatmentPackageSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  examinationCount: z.number().int().min(0).optional(),
  controlCount: z.number().int().min(0).optional(),
  validityDays: z.number().int().min(1).optional(),
  price: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
  providerIds: z.array(z.uuid()).optional(),
  items: z.array(TreatmentPackageItemInputSchema).optional(),
});
