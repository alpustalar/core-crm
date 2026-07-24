import { z } from 'zod';
import { UpdateAppointmentDetailsSchema } from '../../schemas/command/update-appointment-details.schema';

export type UpdateAppointmentDetails = z.infer<
  typeof UpdateAppointmentDetailsSchema
>;
