import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IConsentTemplateQueryRepository } from '@modules/clinical/consent-form/domain/repositories/consent-form.repository';
import { ConsentFormTemplate } from '@modules/clinical/consent-form/domain/entities/consent-form-template.entity';
import { FindConsentTemplatesFilter } from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';
import { Paginated } from '@common/interfaces/paginated.type';

@Injectable()
export class ConsentFormTemplateQueryRepository
  extends BaseRepository
  implements IConsentTemplateQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<ConsentFormTemplate | null> {
    const raw = await this.db.consentFormTemplate.findUnique({
      where: { id },
    });
    return raw ? new ConsentFormTemplate(raw) : null;
  }

  async findMany(
    filter: FindConsentTemplatesFilter
  ): Promise<Paginated<ConsentFormTemplate>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.sectorId) where.sectorId = filter.sectorId;

    const result = await paginate({
      delegate: this.db.consentFormTemplate,
      pagination: filter.pagination,
      where,
    });
    return this.mapPagination(result, (r) => new ConsentFormTemplate(r));
  }
}
