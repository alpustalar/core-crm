import { z } from 'zod';
import {
  AddTreatmentChargeSchema,
  UpdateChargeDiscountSchema,
  VoidTreatmentChargeSchema,
} from '../../schemas/commands';

export type AddTreatmentCharge = z.infer<typeof AddTreatmentChargeSchema>;
export type UpdateChargeDiscount = z.infer<typeof UpdateChargeDiscountSchema>;
export type VoidTreatmentCharge = z.infer<typeof VoidTreatmentChargeSchema>;
