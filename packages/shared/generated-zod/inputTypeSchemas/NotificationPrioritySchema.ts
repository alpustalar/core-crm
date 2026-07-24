import { z } from 'zod';

export const NotificationPrioritySchema = z.enum(['LOW','MEDIUM','HIGH','CRITICAL']);

export type NotificationPriorityType = `${z.infer<typeof NotificationPrioritySchema>}`

export default NotificationPrioritySchema;
