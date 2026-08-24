import { Injectable } from '@nestjs/common';
import {
  StaffNotification as PrismaStaffNotification,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Paginated } from '@common/interfaces/paginated.type';
import { IStaffNotificationQueryRepository } from '@modules/platform/notification/domain/repositories/staff-notification.repository';
import { FindStaffNotificationsByRecipientProps } from '@modules/platform/notification/domain/contracts/staff-notification';

@Injectable()
export class StaffNotificationQueryRepository
  extends BaseRepository
  implements IStaffNotificationQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByRecipient({
    staffId,
    pagination,
    onlyUnread,
  }: FindStaffNotificationsByRecipientProps): Promise<
    Paginated<PrismaStaffNotification>
  > {
    const where: Prisma.StaffNotificationWhereInput = {
      staffId,
      ...(onlyUnread ? { isRead: false } : {}),
    };

    return paginate<
      PrismaStaffNotification,
      Prisma.StaffNotificationWhereInput
    >({
      delegate: this.db.staffNotification,
      pagination,
      where,
    });
  }

  countUnread(staffId: string): Promise<number> {
    return this.db.staffNotification.count({
      where: { staffId, isRead: false },
    });
  }
}
