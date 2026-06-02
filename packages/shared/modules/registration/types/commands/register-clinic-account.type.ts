import { z } from 'zod';
import { RegisterClinicAccountSchema } from '../../schemas/commands';

export type RegisterClinicAccount = z.infer<typeof RegisterClinicAccountSchema>;
