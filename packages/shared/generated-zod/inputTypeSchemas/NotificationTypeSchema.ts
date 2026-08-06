import { z } from 'zod';

export const NotificationTypeSchema = z.enum(['APPOINTMENT_REQUESTED','APPOINTMENT_CONFIRMED','APPOINTMENT_CANCELLED','APPOINTMENT_CANCELLED_LATE','APPOINTMENT_RESCHEDULED','WORK_ORDER_OVERDUE','WORK_ORDER_DUE_SOON','SYSTEM_ANNOUNCEMENT']);

export type NotificationTypeType = `${z.infer<typeof NotificationTypeSchema>}`

export default NotificationTypeSchema;
