import { z } from 'zod';
import { GetAppointmentChargesSchema } from '../../schemas/queries';

export type GetAppointmentCharges = z.infer<
  typeof GetAppointmentChargesSchema
>;
