import { Injectable } from '@nestjs/common';
import {
  StaffNotification as PrismaStaffNotification,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { Paginated } from '@common/interfaces/paginated.type';
import { StaffNotification } from '@modules/platform/notification/domain/entities/staff-notification.entity';
import { IStaffNotificationQueryRepository } from '@modules/platform/notification/domain/repositories/staff-notification.repository';
import { FindStaffNotificationsByRecipientProps } from '@modules/platform/notification/domain/contracts/staff-notification.contracts';

@Injectable()
export class StaffNotificationQueryRepository
  extends BaseRepository
  implements IStaffNotificationQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByRecipient({
    staffId,
    pagination,
    onlyUnread,
  }: FindStaffNotificationsByRecipientProps): Promise<
    Paginated<StaffNotification>
  > {
    const where: Prisma.StaffNotificationWhereInput = {
      staffId,
      ...(onlyUnread ? { isRead: false } : {}),
    };

    const { items, total } = await paginate<
      PrismaStaffNotification,
      Prisma.StaffNotificationWhereInput
    >({
      delegate: this.db.staffNotification,
      pagination,
      where,
    });

    return { items: items.map((raw) => new StaffNotification(raw)), total };
  }

  countUnread(staffId: string): Promise<number> {
    return this.db.staffNotification.count({
      where: { staffId, isRead: false },
    });
  }
}
