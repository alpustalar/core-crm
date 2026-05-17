import { Injectable } from '@nestjs/common';
import { Module, Subscription, SubscriptionItem, SubStatus } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  AddItemInput,
  CreateSubscriptionInput,
  ISubscriptionRepository,
  SubscriptionWithItems,
} from '@modules/subscription/domain/repositories/subscription.repository.interface';

@Injectable()
export class SubscriptionRepository
  extends BaseRepository
  implements ISubscriptionRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(data: CreateSubscriptionInput): Promise<Subscription> {
    return this.db.subscription.create({
      data: {
        organizationId: data.organizationId,
        externalId: data.externalId,
      },
    });
  }

  findByOrganizationId(
    organizationId: string
  ): Promise<SubscriptionWithItems | null> {
    return this.db.subscription.findUnique({
      where: { organizationId },
      include: {
        items: {
          include: { module: true },
        },
      },
    });
  }

  findByExternalId(externalId: string): Promise<Subscription | null> {
    return this.db.subscription.findUnique({ where: { externalId } });
  }

  addItem(data: AddItemInput): Promise<SubscriptionItem> {
    return this.db.subscriptionItem.create({
      data: {
        subscriptionId: data.subscriptionId,
        planId: data.planId,
        moduleId: data.moduleId,
        priceAtPurchase: data.priceAtPurchase,
        externalPriceId: data.externalPriceId,
      },
    });
  }

  findModuleByKey(key: string): Promise<Module | null> {
    return this.db.module.findUnique({ where: { key } });
  }

  async existsByOrganizationId(organizationId: string): Promise<boolean> {
    const sub = await this.db.subscription.findUnique({
      where: { organizationId },
      select: { id: true },
    });
    return !!sub;
  }

  async updateStatus(id: string, status: SubStatus): Promise<void> {
    await this.db.subscription.update({ where: { id }, data: { status } });
  }

  async updateExternalId(id: string, externalId: string): Promise<void> {
    await this.db.subscription.update({ where: { id }, data: { externalId } });
  }
}
