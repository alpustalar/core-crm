import { z } from 'zod';

export const PatientPackageStatusSchema = z.enum([
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'SUSPENDED',
]);

export const UpdatePatientPackageSchema = z.object({
  notes: z.string().optional(),
  status: PatientPackageStatusSchema.optional(),
  providerId: z.uuid().optional(),
  usedExaminationCount: z.number().int().min(0).optional(),
  usedControlCount: z.number().int().min(0).optional(),
});
