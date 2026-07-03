import { z } from 'zod';
import PatientPackageStatusSchema from '@shared/generated-zod/inputTypeSchemas/PatientPackageStatusSchema';



export const UpdatePatientPackageSchema = z.object({
  notes: z.string().optional(),
  status: PatientPackageStatusSchema.optional(),
  providerId: z.uuid().optional(),
  usedExaminationCount: z.number().int().min(0).optional(),
  usedControlCount: z.number().int().min(0).optional(),
});
