import { CancelAppointmentSchema } from '@shared/modules/appointment/schemas/command/cancel-appointment.schema';
import { z } from 'zod';

export type CancelAppointment = z.infer<typeof CancelAppointmentSchema>;
