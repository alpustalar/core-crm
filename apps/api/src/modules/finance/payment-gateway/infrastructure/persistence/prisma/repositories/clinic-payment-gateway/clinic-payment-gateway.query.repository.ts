import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IClinicPaymentGatewayQueryRepository } from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway.repository';
import { ClinicPaymentGateway as IClinicPaymentGateway } from '@shared';

@Injectable()
export class ClinicPaymentGatewayQueryRepository
  extends BaseRepository
  implements IClinicPaymentGatewayQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<IClinicPaymentGateway | null> {
    return this.db.clinicPaymentGateway.findUnique({
      where: { clinicId },
    });
  }
}
