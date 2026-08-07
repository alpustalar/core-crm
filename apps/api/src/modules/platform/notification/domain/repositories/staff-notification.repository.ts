import { StaffNotification as IStaffNotification } from '@shared';
import { StaffNotification } from '@modules/platform/notification/domain/entities/staff-notification.entity';
import { Paginated } from '@common/interfaces/paginated.type';
import { NotificationDeliveryStatusType } from '@input-type-schemas/NotificationDeliveryStatusSchema';
import { FindStaffNotificationsByRecipientProps } from '@modules/platform/notification/domain/contracts/staff-notification.contracts';

export const STAFF_NOTIFICATION_COMMAND_REPOSITORY = Symbol(
  'IStaffNotificationCommandRepository'
);
export const STAFF_NOTIFICATION_QUERY_REPOSITORY = Symbol(
  'IStaffNotificationQueryRepository'
);

export interface IStaffNotificationCommandRepository {
  /** Toplu ekleme — bir event birden çok personele bildirim üretir. */
  createMany(notifications: StaffNotification[]): Promise<void>;
  findById(id: string): Promise<StaffNotification | null>;
  update(notification: StaffNotification): Promise<StaffNotification>;
  /** Alıcının tüm okunmamışlarını okundu işaretler; etkilenen satır sayısı döner. */
  markAllRead(staffId: string): Promise<number>;
  /** Real-time push sonucu teslimat durumunu toplu günceller (SENT/FAILED). */
  markDeliveryStatus(
    ids: string[],
    status: NotificationDeliveryStatusType
  ): Promise<void>;
}

/** Okuma tarafı: entity değil, plain model döner (veri HTTP sınırını geçiyor). */
export interface IStaffNotificationQueryRepository {
  findByRecipient(
    props: FindStaffNotificationsByRecipientProps
  ): Promise<Paginated<IStaffNotification>>;
  countUnread(staffId: string): Promise<number>;
}
