import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { Pagination, Provider } from '@shared';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';

import { Paginated } from '@common/interfaces/paginated.type';
import { normalizeArray } from '@common/utils/normalize-array';
import { ProviderDirectoryEntry } from '@modules/clinical/provider/domain/contracts/provider.contracts';
import { IProviderQueryRepository } from '@modules/clinical/provider/domain/repositories/provider/provider.query.repository.interface';

/** Uzmanlık/unvan adı çözümünde tercih edilen dil; yoksa ilk çeviriye düşülür. */
const PREFERRED_LANG_CODE = 'TR';

type TranslationRow = { name: string; language: { code: string } };

@Injectable()
export class ProviderQueryRepository
  extends BaseRepository
  implements IProviderQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(providerId: string): Promise<Provider | null> {
    return this.db.provider.findUnique({
      where: { id: providerId },
    });
  }

  findManyByClinicIds(
    pagination: Pagination,
    clinicIds: string[] | string
  ): Promise<Paginated<Provider>> {
    return paginate({
      delegate: this.db.provider,
      pagination,
      where: {
        clinicId: {
          in: normalizeArray(clinicIds),
        },
      },
    });
  }

  findManyByOrganizationId(
    pagination: Pagination,
    organizationIds: string[] | string
  ): Promise<Paginated<Provider>> {
    return paginate({
      delegate: this.db.provider,
      pagination,
      where: {
        clinic: { organizationId: { in: normalizeArray(organizationIds) } },
      },
    });
  }

  /**
   * Read-model: kliniğin aktif provider'ları + uzmanlık/unvan adları (çeviriden çözülmüş).
   * Sınırlı/bounded bir iç projeksiyon (AI uzman eşleştirme) olduğu için sayfalama yoktur;
   * tek sorguda user + specialty/title çevirileri include edilir.
   */
  async findDirectoryByClinicId(
    clinicId: string
  ): Promise<ProviderDirectoryEntry[]> {
    const rows = await this.db.provider.findMany({
      where: { clinicId, isActive: true, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { displayName: true } },
        specialty: {
          include: {
            translations: { include: { language: { select: { code: true } } } },
          },
        },
        title: {
          include: {
            translations: { include: { language: { select: { code: true } } } },
          },
        },
      },
    });

    return rows.map((r) => ({
      providerId: r.id,
      name: r.user?.displayName ?? 'Doktor',
      specialty: this.resolveTranslation(r.specialty?.translations),
      title: this.resolveTranslation(r.title?.translations),
      isActive: r.isActive,
    }));
  }

  /** Çeviri listesinden tercih edilen dili (yoksa ilkini) seçip adını döner. */
  private resolveTranslation(translations?: TranslationRow[]): string | null {
    if (!translations || translations.length === 0) return null;
    const preferred = translations.find(
      (t) => t.language.code === PREFERRED_LANG_CODE
    );
    return (preferred ?? translations[0]).name;
  }
}
