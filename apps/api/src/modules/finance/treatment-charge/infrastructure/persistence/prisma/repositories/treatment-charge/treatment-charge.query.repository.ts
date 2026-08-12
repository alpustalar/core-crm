import { Injectable } from '@nestjs/common';
import { TreatmentCharge as ITreatmentCharge } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ITreatmentChargeQueryRepository } from '@modules/finance/treatment-charge/domain/repositories/treatment-charge/treatment-charge.query.repository';

@Injectable()
export class TreatmentChargeQueryRepository
  extends BaseRepository
  implements ITreatmentChargeQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Satır listesi sayfalanmaz: bir randevunun işlem satırları doğası gereği
   * azdır ve ekranda toplamıyla birlikte bir bütün olarak gösterilir —
   * sayfalamak toplamı anlamsız kılardı.
   */
  findByAppointmentId(input: {
    appointmentId: string;
    includeVoided: boolean;
  }): Promise<ITreatmentCharge[]> {
    return this.db.treatmentCharge.findMany({
      where: {
        appointmentId: input.appointmentId,
        ...(input.includeVoided ? {} : { voidedAt: null }),
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string): Promise<ITreatmentCharge | null> {
    return this.db.treatmentCharge.findUnique({ where: { id } });
  }
}
