import { z } from 'zod';
import { PatientBookAppointmentSchema } from '../../schemas/commands';

export type PatientBookAppointment = z.infer<typeof PatientBookAppointmentSchema>;
