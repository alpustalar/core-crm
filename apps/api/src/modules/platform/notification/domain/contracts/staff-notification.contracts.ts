import { z } from 'zod';
import { Pagination } from '@shared';
import { NotificationTypeSchema } from '@input-type-schemas/NotificationTypeSchema';
import { NotificationPrioritySchema } from '@input-type-schemas/NotificationPrioritySchema';
import { NotificationDeliveryStatusSchema } from '@input-type-schemas/NotificationDeliveryStatusSchema';

// ==========================================
// STAFF (IN-APP) BİLDİRİM SÖZLEŞMELERİ
// ==========================================
// Personel panel-içi bildirim merkezi kayıtları. Hasta bildirimleri dış
// kanallardan (messaging/mail) gider; bu sözleşme yalnız in-app kapsar.

/** Entity static create() girişi → Props. */
export const CreateStaffNotificationSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  staffId: z.uuid(),
  type: NotificationTypeSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  paramsJson: z.record(z.string(), z.unknown()).nullable().optional(),
  deepLink: z.record(z.string(), z.unknown()).nullable().optional(),
  priority: NotificationPrioritySchema.optional(),
});

export type CreateStaffNotificationProps = z.infer<
  typeof CreateStaffNotificationSchema
>;

/** Alıcıya (personel) göre bildirim listeleme girişi. */
export interface FindStaffNotificationsByRecipientProps {
  staffId: string;
  pagination: Pagination;
  /** true ise yalnız okunmamışlar döner. */
  onlyUnread?: boolean;
}

/** Real-time (SSE) push gövdesi — client zil/toast için kullanır. */
export interface StaffNotificationRealtimePayload {
  id: string;
  type: z.infer<typeof NotificationTypeSchema>;
  title: string;
  body: string;
  priority: z.infer<typeof NotificationPrioritySchema>;
  deepLink: Record<string, unknown> | null;
  createdAt: Date;
}

/** Liste okuma-modeli (tek kayıt) — panel bildirim merkezi. */
export interface StaffNotificationListItem {
  id: string;
  type: z.infer<typeof NotificationTypeSchema>;
  title: string;
  body: string;
  deepLink: Record<string, unknown> | null;
  paramsJson: Record<string, unknown> | null;
  priority: z.infer<typeof NotificationPrioritySchema>;
  isRead: boolean;
  readAt: Date | null;
  deliveryStatus: z.infer<typeof NotificationDeliveryStatusSchema>;
  createdAt: Date;
}
