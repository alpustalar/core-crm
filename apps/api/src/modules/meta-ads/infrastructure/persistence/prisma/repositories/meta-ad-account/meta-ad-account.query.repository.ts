import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IMetaAdAccountQueryRepository } from '@modules/meta-ads/domain/repositories/meta-ad-account.repository.interface';
import { MetaAdAccount } from '@modules/meta-ads/domain/entities/meta-ad-account.entity';

@Injectable()
export class MetaAdAccountQueryRepository
  extends BaseRepository
  implements IMetaAdAccountQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<MetaAdAccount | null> {
    const raw = await this.db.metaAdAccount.findUnique({ where: { id } });
    return raw ? new MetaAdAccount(raw) : null;
  }

  async findByClinicId(clinicId: string): Promise<MetaAdAccount[]> {
    const rows = await this.db.metaAdAccount.findMany({
      where: { clinicId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => new MetaAdAccount(r));
  }

  async findAllActive(): Promise<MetaAdAccount[]> {
    const rows = await this.db.metaAdAccount.findMany({
      where: { isActive: true },
    });
    return rows.map((r) => new MetaAdAccount(r));
  }

  async findExpiringSoon(withinDays: number): Promise<MetaAdAccount[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + withinDays);
    const rows = await this.db.metaAdAccount.findMany({
      where: {
        isActive: true,
        tokenExpiresAt: { lte: threshold },
      },
    });
    return rows.map((r) => new MetaAdAccount(r));
  }

  async findByClinicAndAdAccountId(
    clinicId: string,
    adAccountId: string,
  ): Promise<MetaAdAccount | null> {
    const raw = await this.db.metaAdAccount.findUnique({
      where: { clinicId_adAccountId: { clinicId, adAccountId } },
    });
    return raw ? new MetaAdAccount(raw) : null;
  }
}
