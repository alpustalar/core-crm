import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import {
  FindActivitiesByLeadFilter,
  FindMyTasksFilter,
} from '@modules/crm/activity/domain/contracts/activity';
import { Paginated } from '@common/interfaces/paginated.type';
import { ActivityTypeSchema } from '@input-type-schemas/ActivityTypeSchema';
import { ActivityStatusSchema } from '@input-type-schemas/ActivityStatusSchema';
import { Activity } from '@shared';
import { IActivityQueryRepository } from '@modules/crm/activity/domain/repositories/activity/activity.query.repository';

@Injectable()
export class ActivityQueryRepository
  extends BaseRepository
  implements IActivityQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<Activity | null> {
    return this.db.activity.findUnique({ where: { id } });
  }

  findByLead(filter: FindActivitiesByLeadFilter): Promise<Paginated<Activity>> {
    return paginate({
      delegate: this.db.activity,
      pagination: filter.pagination,
      where: { leadId: filter.leadId, clinicId: filter.clinicId },
    });
  }

  async findMyTasks(filter: FindMyTasksFilter): Promise<Paginated<Activity>> {
    const where: Record<string, unknown> = {
      assignedToId: filter.assignedToId,
      // NOTE eyleme dönük bir görev değildir — my-tasks listesinden hariç.
      type: {
        in: [
          ActivityTypeSchema.enum.TASK,
          ActivityTypeSchema.enum.CALL,
          ActivityTypeSchema.enum.MEETING,
        ],
      },
      status: filter.status ?? ActivityStatusSchema.enum.PENDING,
    };
    if (filter.clinicId) where.clinicId = filter.clinicId;

    return await paginate({
      delegate: this.db.activity,
      pagination: filter.pagination,
      where,
    });
  }
}
