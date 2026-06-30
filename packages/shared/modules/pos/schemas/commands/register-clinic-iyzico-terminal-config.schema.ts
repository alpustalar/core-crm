import { z } from 'zod';

export const RegisterClinicIyzicoTerminalConfigSchema = z.object({
  clinicId: z.uuid(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
});
