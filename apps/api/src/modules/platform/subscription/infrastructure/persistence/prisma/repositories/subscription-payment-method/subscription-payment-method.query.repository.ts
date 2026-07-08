import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ISubscriptionPaymentMethodQueryRepository } from '@modules/platform/subscription/domain/repositories/subscription-payment-method.repository.interface';
import { SavedCardChargeModel } from '@modules/platform/subscription/domain/subscription.contracts';

@Injectable()
export class SubscriptionPaymentMethodQueryRepository
  extends BaseRepository
  implements ISubscriptionPaymentMethodQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
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
}
