import { Injectable } from '@nestjs/common';
import { MetaAdAccount as IMetaAdAccount } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaAdAccountQueryRepository } from '@modules/crm/meta-ads/domain/repositories/meta-ad-account.repository';

/**
 * Okuma tarafı: entity hidrate edilmez. Token yenileme / metrik senkronu gibi
 * yazma tarafı taramaları Command Repo'dadır.
 */
@Injectable()
export class MetaAdAccountQueryRepository
  extends BaseRepository
  implements IMetaAdAccountQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClinicId(clinicId: string): Promise<IMetaAdAccount[]> {
    return this.db.metaAdAccount.findMany({
      where: { clinicId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllActive(): Promise<IMetaAdAccount[]> {
    return this.db.metaAdAccount.findMany({ where: { isActive: true } });
  }
}
