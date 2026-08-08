import { Expose, Type } from 'class-transformer';
import { ResponseGroups } from '@common/constants/response-groups.constant';
import { NotificationTypeType as NotificationType } from '@input-type-schemas/NotificationTypeSchema';
import { NotificationPriorityType as NotificationPriority } from '@input-type-schemas/NotificationPrioritySchema';
import { NotificationDeliveryStatusType as NotificationDeliveryStatus } from '@input-type-schemas/NotificationDeliveryStatusSchema';

const { INTERNAL, MANAGEMENT, ADMIN } = ResponseGroups;

export class StaffNotificationResponseDto {
  @Expose() id: string;
  @Expose() clinicId: string;
  @Expose() staffId: string;

  // --- Temel Bildirim İçeriği (Herkes Görebilir / UI Tüketimi) ---
  @Expose() type: NotificationType;
  @Expose() title: string;
  @Expose() body: string;
  @Expose() priority: NotificationPriority;

  @Expose() isRead: boolean;

  @Expose()
  @Type(() => Date)
  readAt: Date | null;

  // --- Yapısal Navigasyon ve Ek Veriler (İç Operasyon ve Üst Roller) ---
  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  paramsJson: any | null;

  @Expose({ groups: [INTERNAL, MANAGEMENT, ADMIN] })
  deepLink: any | null;

  // --- Push Teslimat ve Altyapı Durumları (Sadece Yönetim ve Admin) ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  deliveryStatus: NotificationDeliveryStatus;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  deliveredAt: Date | null;

  // --- Audit Zaman Damgaları ---
  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  createdAt: Date;

  @Expose({ groups: [MANAGEMENT, ADMIN] })
  @Type(() => Date)
  updatedAt: Date;
}
