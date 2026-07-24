import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicPaymentGatewayCommandRepository } from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway.repository';
import { ClinicPaymentGateway } from '@modules/finance/payment-gateway/domain/entities/clinic-payment-gateway.entity';

@Injectable()
export class ClinicPaymentGatewayCommandRepository
  extends BaseRepository
  implements IClinicPaymentGatewayCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // 1:1 satellite (clinicId unique) → get-or-create semantiği. save (pure update)
  // yerine ismiyle upsert.
  async upsertByClinicId(
    entity: ClinicPaymentGateway
  ): Promise<ClinicPaymentGateway> {
    const data = entity.toPersistence();
    const raw = await this.db.clinicPaymentGateway.upsert({
      where: { clinicId: data.clinicId },
      create: data,
      update: { iyzicoSubMerchantKey: data.iyzicoSubMerchantKey },
    });
    entity.flushEvents();
    return new ClinicPaymentGateway(raw);
  }
}
