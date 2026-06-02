import { GetClinicAppointmentsSchema } from '@shared/modules';
import { z } from 'zod';

export type GetClinicAppointments = z.infer<typeof GetClinicAppointmentsSchema>;
