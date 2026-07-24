import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { GetMyNotificationsQuery } from './get-my-notifications.query';
import { GetMyNotificationsResponse } from './get-my-notifications.response';
import {
  IStaffNotificationQueryRepository,
  STAFF_NOTIFICATION_QUERY_REPOSITORY,
} from '@modules/platform/notification/domain/repositories/staff-notification.repository';
import { StaffNotification } from '@modules/platform/notification/domain/entities/staff-notification.entity';
import { StaffNotificationListItem } from '@modules/platform/notification/domain/contracts/staff-notification.contracts';

@QueryHandler(GetMyNotificationsQuery)
export class GetMyNotificationsHandler
  implements IQueryHandler<GetMyNotificationsQuery, GetMyNotificationsResponse>
{
  constructor(
    @Inject(STAFF_NOTIFICATION_QUERY_REPOSITORY)
    private readonly staffNotificationQueryRepo: IStaffNotificationQueryRepository
  ) {}

  async execute(
    query: GetMyNotificationsQuery
  ): Promise<GetMyNotificationsResponse> {
    const { pagination, ctx, onlyUnread } = query.payload;

    const result = await this.staffNotificationQueryRepo.findByRecipient({
      staffId: ctx.actor.userId,
      pagination,
      onlyUnread,
    });

    return {
      data: result.items.map((notification) => this.toListItem(notification)),
      meta: {
        pagination: buildPaginationMeta(pagination, result.total),
      },
    };
  }

  private toListItem(
    notification: StaffNotification
  ): StaffNotificationListItem {
    return {
      id: notification.id.value,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      deepLink: notification.deepLink,
      paramsJson: notification.paramsJson,
      priority: notification.priority,
      isRead: notification.isRead,
      readAt: notification.readAt,
      deliveryStatus: notification.deliveryStatus,
      createdAt: notification.createdAt,
    };
  }
}
