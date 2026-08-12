import { z } from 'zod';

export const CreatePatientSchema = z.object({
  phone: z.string().min(1),
  organizationId: z.uuid().optional().nullable(),
  clinicId: z.uuid(),
  firstName: z.string().min(1),
  firebaseUid: z.string().min(1).optional(),
});
