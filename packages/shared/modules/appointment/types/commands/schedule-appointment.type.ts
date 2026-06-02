import { ScheduleAppointmentSchema } from '@shared/modules/index';
import { z } from 'zod';

export type ScheduleAppointment = z.infer<typeof ScheduleAppointmentSchema>;
