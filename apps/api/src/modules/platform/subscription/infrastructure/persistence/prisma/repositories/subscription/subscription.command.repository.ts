import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SubStatusSchema } from '@shared';
import { Decimal } from 'decimal.js';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import type {
  ISubscriptionCommandRepository,
  SubscriptionOwnerRef,
} from '@modules/platform/subscription/domain/repositories/subscription.repository.interface';
import { Subscription } from '@modules/platform/subscription/domain/entities/subscription.entity';
import { Module as IModule } from '@shared';
import { RenewalChargeModel } from '@modules/platform/subscription/domain/subscription.contracts';
import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { ConcurrencyConflictException } from '@common/domain/exceptions/concurrency-conflict.exception';

/** Zamanlanmış tarama başına üst sınır — bir turda işlenecek aday sayısı. */
const SCAN_BATCH_SIZE = 500;

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

  async findByIdForUpdate(id: string): Promise<Subscription | null> {
    await this.lockRowForUpdate('subscriptions', id);
    return this.findById(id);
  }

  async findByExternalIdForUpdate(
    externalId: string
  ): Promise<Subscription | null> {
    const existing = await this.db.subscription.findUnique({
      where: { externalId },
      select: { id: true },
    });
    if (!existing) return null;

    return this.findByIdForUpdate(existing.id);
  }

  async existsByOwner(owner: SubscriptionOwnerRef): Promise<boolean> {
    // Clinic-billed: klinik-başına tek. Org-billed: org-başına tek (clinicId null).
    const where: Prisma.SubscriptionWhereInput = owner.clinicId
      ? { clinicId: owner.clinicId }
      : { organizationId: owner.organizationId, clinicId: null };
    const row = await this.db.subscription.findFirst({
      where,
      select: { id: true },
    });
    return !!row;
  }

  async findDueForRenewal(now: Date): Promise<Subscription[]> {
    const rows = await this.db.subscription.findMany({
      where: {
        status: SubStatusSchema.enum.ACTIVE,
        currentPeriodEnd: { lt: now },
      },
      take: SCAN_BATCH_SIZE,
    });
    return rows.map((r) => new Subscription(r));
  }

  async findExpiredTrials(now: Date): Promise<Subscription[]> {
    const rows = await this.db.subscription.findMany({
      where: {
        status: SubStatusSchema.enum.ACTIVE,
        trialEndsAt: { not: null, lt: now },
      },
      take: SCAN_BATCH_SIZE,
    });
    return rows.map((r) => new Subscription(r));
  }

  async findPastDue(): Promise<Subscription[]> {
    const rows = await this.db.subscription.findMany({
      where: { status: SubStatusSchema.enum.PAST_DUE },
      take: SCAN_BATCH_SIZE,
    });
    return rows.map((r) => new Subscription(r));
  }

  async findRenewalCharge(
    subscriptionId: string
  ): Promise<RenewalChargeModel | null> {
    // Aylık tutar = aboneliğin tüm kalemlerinin (plan + eklenti modüller) toplamı; tek para birimi.
    const items = await this.db.subscriptionItem.findMany({
      where: { subscriptionId },
      select: { priceAtPurchase: true, currency: true },
    });
    if (items.length === 0) return null;

    const amount = items.reduce(
      (sum, item) => sum.add(new Decimal(item.priceAtPurchase.toString())),
      new Decimal(0)
    );

    return { amount, currency: items[0].currency };
  }
  async findByOrganizationId(
    organizationId: string
  ): Promise<Subscription | null> {
    const raw = await this.db.subscription.findFirst({
      where: { organizationId },
    });
    return raw ? new Subscription(raw) : null;
  }

  findModuleByKey(key: string): Promise<IModule | null> {
    return this.db.module.findUnique({ where: { key } });
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
