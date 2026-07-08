import { z } from 'zod';

export const AppointmentCreatorTypeSchema = z.enum(['CLINIC_STAFF','PATIENT','AI_AGENT','SYSTEM']);

export type AppointmentCreatorTypeType = `${z.infer<typeof AppointmentCreatorTypeSchema>}`

export default AppointmentCreatorTypeSchema;
