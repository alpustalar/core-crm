import { z } from 'zod';
import {
  CreateTreatmentPackageSchema,
  TreatmentPackageItemSchema,
} from '../../schemas/command';

export type TreatmentPackageItem = z.infer<typeof TreatmentPackageItemSchema>;
export type CreateTreatmentPackage = z.infer<typeof CreateTreatmentPackageSchema>;
