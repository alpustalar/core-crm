import { z } from 'zod';
import { FindTreatmentPackagesSchema } from '../../schemas/queries';

export type FindTreatmentPackages = z.infer<typeof FindTreatmentPackagesSchema>;
