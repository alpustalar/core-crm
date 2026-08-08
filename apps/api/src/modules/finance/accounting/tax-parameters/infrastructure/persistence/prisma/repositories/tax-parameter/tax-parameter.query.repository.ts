import { Injectable } from '@nestjs/common';
import { TaxParameter as ITaxParameter } from '@shared';
import { TaxParameterKeyType as TaxParameterKey } from '@input-type-schemas/TaxParameterKeySchema';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ITaxParameterQueryRepository } from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter/tax-parameter.query.repository';

/**
 * Okuma tarafı: entity hidrate edilmez. Oranı kapatma/versiyonlama gibi iş kuralı
 * gerektiren okumalar Command Repo'dan (kilitli) yapılır.
 */
@Injectable()
export class TaxParameterQueryRepository
  extends BaseRepository
  implements ITaxParameterQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findEffective(
    clinicId: string,
    key: TaxParameterKey,
    date: Date
  ): Promise<ITaxParameter | null> {
    return this.db.taxParameter.findFirst({
      where: {
        clinicId,
        key,
        validFrom: { lte: date },
        OR: [{ validTo: null }, { validTo: { gte: date } }],
      },
      orderBy: { validFrom: 'desc' },
    });
  }

  findAllByClinicId(clinicId: string): Promise<ITaxParameter[]> {
    return this.db.taxParameter.findMany({
      where: { clinicId },
      orderBy: [{ key: 'asc' }, { validFrom: 'desc' }],
    });
  }
}
