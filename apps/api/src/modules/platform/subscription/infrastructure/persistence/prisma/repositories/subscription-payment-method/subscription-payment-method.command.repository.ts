import { Injectable } from '@nestjs/common';
import { BaseCommandRepository } from '@src/infrastructure/persistence/prisma/base-command.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { SubscriptionPaymentMethod } from '@modules/platform/subscription/domain/entities/subscription-payment-method.entity';
import { ISubscriptionPaymentMethodCommandRepository } from '@modules/platform/subscription/domain/repositories/subscription-payment-method.repository.interface';
import {
  CreateSubscriptionPaymentMethodProps,
  SavedCardChargeModel,
} from '@modules/platform/subscription/domain/subscription.contracts';

@Injectable()
export class SubscriptionPaymentMethodCommandRepository
  extends BaseCommandRepository<SubscriptionPaymentMethod>
  implements ISubscriptionPaymentMethodCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<SubscriptionPaymentMethod | null> {
    const raw = await this.db.subscriptionPaymentMethod.findUnique({
      where: { id },
    });
    return raw ? new SubscriptionPaymentMethod(raw) : null;
  }

  async findBySubscriptionId(
    subscriptionId: string
  ): Promise<SavedCardChargeModel | null> {
    const raw = await this.db.subscriptionPaymentMethod.findUnique({
      where: { subscriptionId },
    });
    if (!raw) return null;

    return {
      cardUserKey: raw.cardUserKey,
      cardToken: raw.cardToken,
      buyer: {
        name: raw.buyerName,
        surname: raw.buyerSurname,
        email: raw.buyerEmail,
        gsmNumber: raw.buyerGsmNumber,
        ip: raw.buyerIp,
        city: raw.buyerCity,
        address: raw.buyerAddress,
      },
    };
  }

  async create(
    entity: SubscriptionPaymentMethod
  ): Promise<SubscriptionPaymentMethod> {
    const data = entity.toPersistence();
    const raw = await this.db.subscriptionPaymentMethod.create({ data });
    return new SubscriptionPaymentMethod(raw);
  }

  async update(
    entity: SubscriptionPaymentMethod
  ): Promise<SubscriptionPaymentMethod> {
    const { id, ...data } = entity.toPersistence();
    const raw = await this.db.subscriptionPaymentMethod.update({
      where: { id },
      data,
    });
    entity.flushEvents();
    return new SubscriptionPaymentMethod(raw);
  }

  async upsertBySubscriptionId(
    props: CreateSubscriptionPaymentMethodProps
  ): Promise<SubscriptionPaymentMethod> {
    const entity = SubscriptionPaymentMethod.create(props);
    const data = entity.toPersistence();
    // Kart değişiminde id/subscriptionId/createdAt sabit kalır; yalnız kart + snapshot güncellenir.
    const { id, subscriptionId, createdAt, updatedAt, ...mutable } = data;
    const raw = await this.db.subscriptionPaymentMethod.upsert({
      where: { subscriptionId },
      create: data,
      update: mutable,
    });
    return new SubscriptionPaymentMethod(raw);
  }
}
