import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IActivityCommandRepository } from '@modules/crm/activity/domain/repositories/activity.repository';
import { Activity } from '@modules/crm/activity/domain/entities/activity.entity';

@Injectable()
export class ActivityCommandRepository
  extends BaseCommandRepository<Activity>
  implements IActivityCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(entity: Activity): Promise<Activity> {
    const raw = await this.db.activity.create({ data: entity.toPersistence() });
    entity.flushEvents();
    return new Activity(raw);
  }

  async findById(id: string): Promise<Activity | null> {
    const raw = await this.db.activity.findUnique({ where: { id } });
    return raw ? new Activity(raw) : null;
  }

  async update(entity: Activity): Promise<Activity> {
    const data = entity.toPersistence();
    const { id, ...update } = data;
    const raw = await this.db.activity.update({ where: { id }, data: update });
    entity.flushEvents();
    return new Activity(raw);
  }

  async deleteById(id: string): Promise<void> {
    await this.db.activity.delete({ where: { id } });
  }
}
