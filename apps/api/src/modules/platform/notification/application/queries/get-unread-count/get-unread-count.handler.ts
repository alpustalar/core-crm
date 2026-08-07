import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUnreadCountQuery } from './get-unread-count.query';
import { GetUnreadCountResponse } from './get-unread-count.response';
import {
  IStaffNotificationQueryRepository,
  STAFF_NOTIFICATION_QUERY_REPOSITORY,
} from '@modules/platform/notification/domain/repositories/staff-notification.repository';

@QueryHandler(GetUnreadCountQuery)
export class GetUnreadCountHandler implements IQueryHandler<
  GetUnreadCountQuery,
  GetUnreadCountResponse
> {
  constructor(
    @Inject(STAFF_NOTIFICATION_QUERY_REPOSITORY)
    private readonly staffNotificationQueryRepo: IStaffNotificationQueryRepository
  ) {}

  async execute(query: GetUnreadCountQuery): Promise<GetUnreadCountResponse> {
    const unreadCount = await this.staffNotificationQueryRepo.countUnread(
      query.ctx.actor.userId
    );
    return { data: { unreadCount } };
  }
}
