import { z } from 'zod';
import { UpsertClinicGovernmentSpecsSchema } from '../schemas/upsert-clinic-government-specs.schema';

export type UpsertClinicGovernmentSpecs = z.infer<
  typeof UpsertClinicGovernmentSpecsSchema
>;
