import { z } from 'zod';
import { PaginationSchema } from '@shared/common/pagination/pagination.schema';
import PatientPackageStatusSchema from '@shared/generated-zod/inputTypeSchemas/PatientPackageStatusSchema';

export const FindPatientPackagesSchema = z.object({
  patientId: z.uuid().optional(),
  status: PatientPackageStatusSchema.optional(),
  pagination: PaginationSchema,
});