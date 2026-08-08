import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ClinicPaymentGateway } from '@shared';
import { IClinicPaymentGatewayQueryRepository } from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway/clinic-payment-gateway.query.repository';

@Injectable()
export class ClinicPaymentGatewayQueryRepository
  extends BaseRepository
  implements IClinicPaymentGatewayQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<ClinicPaymentGateway | null> {
    return this.db.clinicPaymentGateway.findUnique({
      where: { clinicId },
    });
  }
}
