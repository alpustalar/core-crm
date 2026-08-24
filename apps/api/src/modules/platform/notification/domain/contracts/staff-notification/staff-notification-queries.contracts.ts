import { Pagination } from '@shared';
import { NotificationTypeType as NotificationType } from '@input-type-schemas/NotificationTypeSchema';
import { NotificationPriorityType as NotificationPriority } from '@input-type-schemas/NotificationPrioritySchema';
import { NotificationDeliveryStatusType as NotificationDeliveryStatus } from '@input-type-schemas/NotificationDeliveryStatusSchema';

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
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  deepLink: Record<string, unknown> | null;
  createdAt: Date;
}

/** Liste okuma-modeli (tek kayıt) — panel bildirim merkezi. */
export interface StaffNotificationListItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  deepLink: Record<string, unknown> | null;
  paramsJson: Record<string, unknown> | null;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: Date | null;
  deliveryStatus: NotificationDeliveryStatus;
  createdAt: Date;
}
