import { z } from 'zod';

export const NotificationDeliveryStatusSchema = z.enum(['PENDING','SENT','FAILED']);

export type NotificationDeliveryStatusType = `${z.infer<typeof NotificationDeliveryStatusSchema>}`

export default NotificationDeliveryStatusSchema;
