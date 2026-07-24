import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { NotificationTypeSchema } from '../inputTypeSchemas/NotificationTypeSchema'
import { NotificationPrioritySchema } from '../inputTypeSchemas/NotificationPrioritySchema'
import { NotificationDeliveryStatusSchema } from '../inputTypeSchemas/NotificationDeliveryStatusSchema'

/////////////////////////////////////////
// STAFF NOTIFICATION SCHEMA
/////////////////////////////////////////

export const StaffNotificationSchema = z.object({
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema,
  deliveryStatus: NotificationDeliveryStatusSchema,
  id: z.string(),
  clinicId: z.string(),
  staffId: z.string(),
  title: z.string(),
  body: z.string(),
  paramsJson: JsonValueSchema.nullable(),
  deepLink: JsonValueSchema.nullable(),
  isRead: z.boolean(),
  readAt: z.coerce.date().nullable(),
  deliveredAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type StaffNotification = z.infer<typeof StaffNotificationSchema>

export default StaffNotificationSchema;
