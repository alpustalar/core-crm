import { z } from 'zod';
import { PatientVerifySchema } from '../../schemas/commands';

export type PatientVerify = z.infer<typeof PatientVerifySchema>;
