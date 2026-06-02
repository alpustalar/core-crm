import { z } from 'zod';

export const AppointmentStatusSchema = z.enum(['PENDING','CONFIRMED','CANCELLED','COMPLETED','NOSHOW']);

export type AppointmentStatusType = `${z.infer<typeof AppointmentStatusSchema>}`

export default AppointmentStatusSchema;
