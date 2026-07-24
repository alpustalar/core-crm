import { z } from 'zod';
import { GetClinicOpenSlotsSchema } from '../../schemas/queries/get-clinic-open-slots.schema';

export type GetClinicOpenSlots = z.infer<typeof GetClinicOpenSlotsSchema>;
