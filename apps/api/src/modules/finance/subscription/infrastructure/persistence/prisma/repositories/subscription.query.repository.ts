import { Injectable } from '@nestjs/common';
import { Module as IModule } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ISubscriptionQueryRepository } from '@modules/finance/subscription/domain/repositories/subscription.repository.interface';
import { Subscription } from '@modules/finance/subscription/domain/entities/subscription.entity';
import { SubscriptionWithItems } from '@modules/finance/subscription/domain/subscription.contracts';

@Injectable()
export class SubscriptionQueryRepository
  extends BaseRepository
  implements ISubscriptionQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByOrganizationId(
    organizationId: string
  ): Promise<SubscriptionWithItems | null> {
    const raw = await this.db.subscription.findUnique({
      where: { organizationId },
      include: { items: { include: { module: true } } },
    });
    if (!raw) return null;
    return new Subscription(raw) as SubscriptionWithItems;
  }

  async findByExternalId(externalId: string): Promise<Subscription | null> {
    const raw = await this.db.subscription.findUnique({
      where: { externalId },
    });
    return raw ? new Subscription(raw) : null;
  }

  findModuleByKey(key: string): Promise<IModule | null> {
    return this.db.module.findUnique({ where: { key } });
  }

  async existsByOrganizationId(organizationId: string): Promise<boolean> {
    const row = await this.db.subscription.findUnique({
      where: { organizationId },
      select: { id: true },
    });
    return !!row;
  }
}
