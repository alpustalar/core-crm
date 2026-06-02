import { z } from 'zod';

export const FindOrCreatePatientForAuthSchema = z.object({
  phone: z.string().min(1),
  organizationId: z.string().uuid(),
  firstName: z.string().min(1),
  firebaseUid: z.string().min(1),
});
