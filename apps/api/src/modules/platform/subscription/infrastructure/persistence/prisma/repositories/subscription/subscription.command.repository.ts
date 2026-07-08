import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import type { ISubscriptionCommandRepository } from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class SubscriptionCommandRepository
  extends BaseCommandRepository<Subscription>
  implements ISubscriptionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Subscription | null> {
    const raw = await this.db.subscription.findUnique({ where: { id } });
    return raw ? new Subscription(raw) : null;
  }
  async create(entity: Subscription): Promise<Subscription> {
    const data = entity.toPersistence();
    const raw = await this.db.subscription.create({ data });
    return new Subscription(raw);
  }

  async save(entity: Subscription): Promise<Subscription> {
    const toPersistence = entity.toPersistence();

    const { id, ...data } = toPersistence;
    const raw = await this.db.subscription.update({
      where: { id },
      data,
    });

    entity.flushEvents();
    return new Subscription(raw);
  }

  async sync(subscription: Subscription): Promise<Subscription | null> {
    const create = subscription.toPersistence();
    const { id, ...update } = create;
    const raw = await this.db.subscription.upsert({
      where: { id },
      create,
      update,
    });

    subscription.flushEvents();
    return raw ? new Subscription(raw) : null;
  }

  async syncMany(subscriptions: Subscription[]): Promise<void> {
    const prismaQueries = subscriptions.map((subscription) => {
      const create = subscription.toPersistence();
      const { id, ...update } = create;
      return this.db.subscription.upsert({
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

    subscriptions.forEach((subscription) => subscription.flushEvents());
  }
}
