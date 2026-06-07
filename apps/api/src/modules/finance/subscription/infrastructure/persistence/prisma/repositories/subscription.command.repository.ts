import { Injectable } from '@nestjs/common';
import { SubStatus } from '@prisma/client';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import type { ISubscriptionCommandRepository } from '@modules/finance/subscription/domain/repositories/subscription.repository.interface';
import { Subscription } from '@modules/finance/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/finance/subscription/domain/entities/subscription-item.entity';
import type { CreateSubscriptionProps } from '@modules/finance/subscription/domain/types/create-subscription.props';
import type { AddItemProps } from '@modules/finance/subscription/domain/types/add-item.props';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';

@Injectable()
export class SubscriptionCommandRepository
  extends BaseCommandRepository<Subscription>
  implements ISubscriptionCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: CreateSubscriptionProps): Promise<Subscription> {
    const raw = await this.db.subscription.create({
      data: {
        organizationId: data.organizationId,
        externalId: data.externalId,
      },
    });
    return new Subscription(raw);
  }

  async addItem(data: AddItemProps): Promise<SubscriptionItem> {
    const raw = await this.db.subscriptionItem.create({
      data: {
        subscriptionId: data.subscriptionId,
        planId: data.planId,
        moduleId: data.moduleId,
        priceAtPurchase: data.priceAtPurchase,
        externalPriceId: data.externalPriceId,
      },
    });
    return new SubscriptionItem(raw);
  }

  async updateStatus(id: string, status: SubStatus): Promise<void> {
    await this.db.subscription.update({ where: { id }, data: { status } });
  }

  async updateExternalId(id: string, externalId: string): Promise<void> {
    await this.db.subscription.update({ where: { id }, data: { externalId } });
  }

  async save(entity: Subscription): Promise<Subscription> {
    const data = entity.toPersistence();
    const raw = await this.db.subscription.upsert({
      where: { id: entity.id },
      create: data,
      update: data,
    });

    entity.flushEvents();
    return new Subscription(raw);
  }

  async saveMany(subscriptions: Subscription[]): Promise<void> {
    const prismaQueries = subscriptions.map((subscription) => {
      const data = subscription.toPersistence();
      return this.db.subscription.upsert({
        where: { id: data.id },
        create: data,
        update: data,
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
