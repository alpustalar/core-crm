import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Module as IModule, SubStatusSchema } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import {
  ISubscriptionQueryRepository,
  SubscriptionOwnerRef,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import {
  ActiveSubscriptionReadModel,
  EntitlementSource,
  RenewalChargeModel,
} from '@modules/platform/subscription/domain/subscription.contracts';
import { Decimal } from 'decimal.js';

/** Read-model'i besleyen include (items + her item'ın modülü). */
const activeInclude = {
  items: { include: { module: true } },
} satisfies Prisma.SubscriptionInclude;

type SubscriptionWithItemsRaw = Prisma.SubscriptionGetPayload<{
  include: typeof activeInclude;
}>;

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
  ): Promise<ActiveSubscriptionReadModel | null> {
    // organizationId artık unique değil (clinic-billed'de org'un çok aboneliği olabilir) → findFirst.
    const raw = await this.db.subscription.findFirst({
      where: { organizationId },
      include: activeInclude,
    });
    return raw ? this.toReadModel(raw) : null;
  }

  findModuleByKey(key: string): Promise<IModule | null> {
    return this.db.module.findUnique({ where: { key } });
  }

  findActiveModules(): Promise<IModule[]> {
    // Katalog küçük ve sınırlı bir liste → doğrudan; ada göre sıralı.
    return this.db.module.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findEntitlementSource(owner: {
    organizationId: string;
    clinicId: string | null;
  }): Promise<EntitlementSource | null> {
    // Önce klinik-billed abonelik (franchise); yoksa org aboneliği (klinik onu miras alır).
    // clinicId @unique → findFirst tek satır döner (WhereUniqueInput bağımlılığı olmadan).
    let raw = owner.clinicId
      ? await this.db.subscription.findFirst({
          where: { clinicId: owner.clinicId },
          include: activeInclude,
        })
      : null;

    if (!raw) {
      raw = await this.db.subscription.findFirst({
        where: { organizationId: owner.organizationId, clinicId: null },
        include: activeInclude,
      });
    }

    if (!raw) return null;

    const planItem = raw.items.find((item) => item.planId != null);
    const addOnModuleKeys = raw.items
      .filter((item) => item.module != null)
      .map((item) => item.module!.key);

    return {
      status: raw.status,
      trialEndsAt: raw.trialEndsAt,
      currentPeriodEnd: raw.currentPeriodEnd,
      planId: planItem?.planId ?? null,
      addOnModuleKeys,
    };
  }

  private toReadModel(
    raw: SubscriptionWithItemsRaw
  ): ActiveSubscriptionReadModel {
    return {
      id: raw.id,
      billingTarget: raw.billingTarget,
      organizationId: raw.organizationId,
      clinicId: raw.clinicId,
      status: raw.status,
      externalId: raw.externalId,
      trialEndsAt: raw.trialEndsAt,
      currentPeriodStart: raw.currentPeriodStart,
      currentPeriodEnd: raw.currentPeriodEnd,
      cancelAtPeriodEnd: raw.cancelAtPeriodEnd,
      createdAt: raw.createdAt,
      // planModules get-active handler tarafından plan tanımından doldurulur (repo bilmez).
      planModules: [],
      items: raw.items.map((item) => ({
        id: item.id,
        planId: item.planId,
        moduleId: item.moduleId,
        priceAtPurchase: item.priceAtPurchase,
        currency: item.currency,
        module: item.module
          ? {
              key: item.module.key,
              name: item.module.name,
              monthlyPrice: item.module.monthlyPrice,
            }
          : null,
      })),
    };
  }
}
