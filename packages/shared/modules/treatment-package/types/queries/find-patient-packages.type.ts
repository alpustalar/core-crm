import { z } from 'zod';
import { FindPatientPackagesSchema } from '../../schemas/queries';

export type FindPatientPackages = z.infer<typeof FindPatientPackagesSchema>;
