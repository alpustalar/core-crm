import { z } from 'zod';

export const CancelAppointmentSchema = z.object({
  appointmentId: z.uuid(),
  cancelReason: z.string().optional(),
});
