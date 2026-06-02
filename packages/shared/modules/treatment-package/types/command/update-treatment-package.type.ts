import { z } from 'zod';
import { UpdateTreatmentPackageSchema } from '../../schemas/command';

export type UpdateTreatmentPackage = z.infer<typeof UpdateTreatmentPackageSchema>;
