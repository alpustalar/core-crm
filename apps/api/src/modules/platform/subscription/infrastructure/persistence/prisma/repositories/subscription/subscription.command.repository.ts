import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import type { ISubscriptionCommandRepository } from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { ConcurrencyConflictException } from '@common/domain/exceptions/concurrency-conflict.exception';

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

  async update(entity: Subscription): Promise<Subscription> {
    const toPersistence = entity.toPersistence();
    const { id, version, ...data } = toPersistence;

    // Optimistic concurrency guard: version hâlâ okuduğumuz değerse günceller ve
    // artırır (ör. yenileme job'u vs. kullanıcı iptali yarışı). Etkilenen satır 0 →
    // kayıt bu arada değişmiş → ConcurrencyConflictException (409).
    const result = await this.db.subscription.updateMany({
      where: { id, version },
      data: { ...data, version: version + 1 },
    });

    if (result.count === 0) {
      throw new ConcurrencyConflictException('Subscription', id);
    }

    entity.flushEvents();
    return new Subscription({ ...toPersistence, version: version + 1 });
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
