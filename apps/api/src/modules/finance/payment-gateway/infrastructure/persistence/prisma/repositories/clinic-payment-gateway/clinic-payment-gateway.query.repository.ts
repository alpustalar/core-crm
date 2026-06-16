import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicPaymentGatewayQueryRepository } from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway.repository';
import { ClinicPaymentGateway } from '@modules/finance/payment-gateway/domain/entities/clinic-payment-gateway.entity';

@Injectable()
export class ClinicPaymentGatewayQueryRepository
  extends BaseRepository
  implements IClinicPaymentGatewayQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByClinicId(
    clinicId: string
  ): Promise<ClinicPaymentGateway | null> {
    const raw = await this.db.clinicPaymentGateway.findUnique({
      where: { clinicId },
    });
    return raw ? new ClinicPaymentGateway(raw) : null;
  }
}
