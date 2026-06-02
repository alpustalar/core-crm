import { z } from 'zod';
import { FindOrCreatePatientForAuthSchema } from '../../schemas/queries';

export type FindOrCreatePatientForAuth = z.infer<typeof FindOrCreatePatientForAuthSchema>;
