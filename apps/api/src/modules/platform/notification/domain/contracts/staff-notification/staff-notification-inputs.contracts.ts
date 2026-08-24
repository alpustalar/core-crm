import { NotificationTypeType as NotificationType } from '@input-type-schemas/NotificationTypeSchema';
import { NotificationPriorityType as NotificationPriority } from '@input-type-schemas/NotificationPrioritySchema';

// ==========================================
// STAFF (IN-APP) BİLDİRİM SÖZLEŞMELERİ
// ==========================================
// Personel panel-içi bildirim merkezi kayıtları. Hasta bildirimleri dış
// kanallardan (messaging/mail) gider; bu sözleşme yalnız in-app kapsar.

/**
 * Entity static create() girişi → Props.
 * title/body her zaman sistem şablonlarından (notification-dispatcher.service.ts)
 * üretilir — kullanıcı girişi değildir, bu yüzden domain katmanında ayrıca
 * boş-string kontrolü yapılmaz.
 */
export interface CreateStaffNotificationProps {
  id?: string;
  clinicId: string;
  staffId: string;
  type: NotificationType;
  title: string;
  body: string;
  paramsJson?: Record<string, unknown> | null;
  deepLink?: Record<string, unknown> | null;
  priority?: NotificationPriority;
}
