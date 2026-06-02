import { z } from 'zod';
import { AssignPackageToPatientSchema } from '../../schemas/command';

export type AssignPackageToPatient = z.infer<typeof AssignPackageToPatientSchema>;
