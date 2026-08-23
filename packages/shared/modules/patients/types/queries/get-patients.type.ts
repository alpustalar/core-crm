import { z } from 'zod';
import { GetPatientsSchema } from '../../schemas/queries';

export type GetPatients = z.infer<typeof GetPatientsSchema>;
