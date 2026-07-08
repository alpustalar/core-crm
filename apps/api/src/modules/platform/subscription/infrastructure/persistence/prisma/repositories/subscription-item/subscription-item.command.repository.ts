import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { SubscriptionItem } from '@modules/platform/subscription/domain/entities/subscription-item.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { ISubscriptionItemCommandRepository } from '@modules/platform/subscription/domain/repositories/subscription-item.repository.interface';

@Injectable()
export class SubscriptionItemCommandRepository
  extends BaseCommandRepository<SubscriptionItem>
  implements ISubscriptionItemCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<SubscriptionItem | null> {
    const raw = await this.db.subscriptionItem.findUnique({ where: { id } });
    return raw ? new SubscriptionItem(raw) : null;
  }
  async create(entity: SubscriptionItem): Promise<SubscriptionItem> {
    const data = entity.toPersistence();
    const raw = await this.db.subscriptionItem.create({ data });
    return new SubscriptionItem(raw);
  }

  async save(entity: SubscriptionItem): Promise<SubscriptionItem> {
    const toPersistence = entity.toPersistence();

    const { id, ...data } = toPersistence;
    const raw = await this.db.subscriptionItem.update({
      where: { id },
      data,
    });

    entity.flushEvents();
    return new SubscriptionItem(raw);
  }

  async sync(
    subscriptionItem: SubscriptionItem
  ): Promise<SubscriptionItem | null> {
    const create = subscriptionItem.toPersistence();
    const { id, ...update } = create;

    const raw = await this.db.subscriptionItem.upsert({
      where: { id },
      create,
      update,
    });

    return raw ? new SubscriptionItem(raw) : null;
  }

  async syncMany(subscriptionItems: SubscriptionItem[]): Promise<void> {
    const prismaQueries = subscriptionItems.map((subscriptionItem) => {
      const create = subscriptionItem.toPersistence();
      const { id, ...update } = create;
      return this.db.subscriptionItem.upsert({
        where: { id },
        create,
        update,
      });
    });

    if (txStorage.getStore()?.tx) {
      await Promise.all(prismaQueries);
    } else {
      await this.prisma.$transaction(prismaQueries);
    }

    subscriptionItems.forEach((subscriptionItem) =>
      subscriptionItem.flushEvents()
    );
  }
}
