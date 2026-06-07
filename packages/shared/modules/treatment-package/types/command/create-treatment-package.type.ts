import { z } from 'zod';
import {
  CreateTreatmentPackageSchema,
  TreatmentPackageItemInputSchema,
} from '../../schemas/command';

export type TreatmentPackageItemInput = z.infer<typeof TreatmentPackageItemInputSchema>;
export type CreateTreatmentPackage = z.infer<typeof CreateTreatmentPackageSchema>;
