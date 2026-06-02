import { z } from 'zod';

export const AssignPackageToPatientSchema = z.object({
  patientId: z.uuid(),
  packageId: z.uuid(),
  providerId: z.uuid(),
  startDate: z.coerce.date(),
  notes: z.string().optional(),
});
