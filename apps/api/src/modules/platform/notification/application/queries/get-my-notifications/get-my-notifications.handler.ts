import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { buildPaginationMeta } from '@src/infrastructure/persistence/prisma/helpers';
import { GetMyNotificationsQuery } from './get-my-notifications.query';
import { GetMyNotificationsResponse } from './get-my-notifications.response';
import {
  IStaffNotificationQueryRepository,
  STAFF_NOTIFICATION_QUERY_REPOSITORY,
} from '@modules/platform/notification/domain/repositories/staff-notification.repository';
import { StaffNotification as IStaffNotification } from '@shared';
import { StaffNotificationListItem } from '@modules/platform/notification/domain/contracts/staff-notification';
import {
  IPolicyFactory,
  POLICY_FACTORY,
} from '@modules/platform/policy/staff/domain/interfaces/policy-factory.interface';

@QueryHandler(GetMyNotificationsQuery)
export class GetMyNotificationsHandler implements IQueryHandler<
  GetMyNotificationsQuery,
  GetMyNotificationsResponse
> {
  constructor(
    @Inject(STAFF_NOTIFICATION_QUERY_REPOSITORY)
    private readonly staffNotificationQueryRepo: IStaffNotificationQueryRepository,
    @Inject(POLICY_FACTORY)
    private readonly policyFactory: IPolicyFactory
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
        // Liste zaten aktörün kendi userId'sine sabit; alan görünürlüğü
        // kliniğinden çözülür (paramsJson gibi yapısal alanlar klinik içi).
        serializationOptions: this.policyFactory
          .clinic(ctx.actor, ctx.source)
          .policy.getSerializationOptions({
            clinicId: ctx.actor.clinicId ?? '',
          }),
      },
    };
  }

  private toListItem(
    notification: IStaffNotification
  ): StaffNotificationListItem {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      deepLink: notification.deepLink as Record<string, unknown> | null,
      paramsJson: notification.paramsJson as Record<string, unknown> | null,
      priority: notification.priority,
      isRead: notification.isRead,
      readAt: notification.readAt,
      deliveryStatus: notification.deliveryStatus,
      createdAt: notification.createdAt,
    };
  }
}
