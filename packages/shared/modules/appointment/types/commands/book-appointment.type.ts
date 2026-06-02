import { BookAppointmentSchema } from '@shared/modules/index';
import { z } from 'zod';

export type BookAppointment = z.infer<typeof BookAppointmentSchema>;
