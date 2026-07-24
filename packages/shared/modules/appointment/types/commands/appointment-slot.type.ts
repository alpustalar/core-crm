import { z } from 'zod';
import { AppointmentSlotSchema } from '../../schemas/command/appointment-slot.schema';

export type AppointmentSlot = z.infer<typeof AppointmentSlotSchema>;
