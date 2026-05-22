import { Injectable } from '@nestjs/common';
import { SubStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import type { ISubscriptionCommandRepository } from '@modules/subscription/domain/repositories/subscription.repository.interface';
import { Subscription } from '@modules/subscription/domain/entities/subscription.entity';
import { SubscriptionItem } from '@modules/subscription/domain/entities/subscription-item.entity';
import type { CreateSubscriptionProps } from '@modules/subscription/domain/types/create-subscription.props';
import type { AddItemProps } from '@modules/subscription/domain/types/add-item.props';

@Injectable()
export class SubscriptionCommandRepository
  extends BaseRepository
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

  async save(entity: Subscription): Promise<void> {
    await this.db.subscription.update({
      where: { id: entity.id },
      data: entity.toPersistence(),
    });
    entity.flushEvents();
  }
}
