import { Injectable } from '@nestjs/common';
import { TaxParameterKey } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { ITaxParameterQueryRepository } from '@modules/finance/accounting/tax-parameters/domain/repositories/tax-parameter.repository';
import { TaxParameter } from '@modules/finance/accounting/tax-parameters/domain/entities/tax-parameter.entity';

@Injectable()
export class TaxParameterQueryRepository
  extends BaseRepository
  implements ITaxParameterQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findEffective(
    clinicId: string,
    key: TaxParameterKey,
    date: Date
  ): Promise<TaxParameter | null> {
    const raw = await this.db.taxParameter.findFirst({
      where: {
        clinicId,
        key,
        validFrom: { lte: date },
        OR: [{ validTo: null }, { validTo: { gte: date } }],
      },
      orderBy: { validFrom: 'desc' },
    });
    return raw ? new TaxParameter(raw) : null;
  }

  async findOpen(
    clinicId: string,
    key: TaxParameterKey
  ): Promise<TaxParameter | null> {
    const raw = await this.db.taxParameter.findFirst({
      where: { clinicId, key, validTo: null },
      orderBy: { validFrom: 'desc' },
    });
    return raw ? new TaxParameter(raw) : null;
  }

  async existsForClinic(clinicId: string): Promise<boolean> {
    const count = await this.db.taxParameter.count({ where: { clinicId } });
    return count > 0;
  }

  async findAllByClinicId(clinicId: string): Promise<TaxParameter[]> {
    const rows = await this.db.taxParameter.findMany({
      where: { clinicId },
      orderBy: [{ key: 'asc' }, { validFrom: 'desc' }],
    });
    return rows.map((raw) => new TaxParameter(raw));
  }
}
