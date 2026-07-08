import { z } from 'zod';

export const AppointmentSourceSchema = z.enum(['CLINIC_INTERNAL','PATIENT_PORTAL','WEB_WIDGET','INTEGRATION']);

export type AppointmentSourceType = `${z.infer<typeof AppointmentSourceSchema>}`

export default AppointmentSourceSchema;
