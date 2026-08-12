import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ITreatmentQueryRepository } from '@modules/clinical/treatment/domain/repositories/treatment/treatment.query.repository';
import { TreatmentPricing } from '@modules/clinical/treatment/domain/contracts/treatment.contracts';

@Injectable()
export class TreatmentQueryRepository
  extends BaseRepository
  implements ITreatmentQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findPricingById(treatmentId: string): Promise<TreatmentPricing | null> {
    return this.db.treatment.findUnique({
      where: { id: treatmentId },
      select: {
        id: true,
        clinicId: true,
        listPrice: true,
        currency: true,
        isActive: true,
      },
    });
  }
}
