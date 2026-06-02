import { z } from 'zod';

export const ConvertLeadSchema = z.object({
  patientId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
}).refine(
  (data) => data.patientId !== undefined || data.appointmentId !== undefined,
  { message: 'patientId veya appointmentId zorunludur.' },
);
