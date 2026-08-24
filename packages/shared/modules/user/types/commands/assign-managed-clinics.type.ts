import { z } from 'zod';
import { AssignManagedClinicsSchema } from '../../schemas/commands';

export type AssignManagedClinics = z.infer<typeof AssignManagedClinicsSchema>;
