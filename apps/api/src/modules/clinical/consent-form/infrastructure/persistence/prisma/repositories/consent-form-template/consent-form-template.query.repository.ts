import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';

import { FindConsentTemplatesFilter } from '@modules/clinical/consent-form/domain/contracts/consent-form.contracts';
import { Paginated } from '@common/interfaces/paginated.type';
import { IConsentTemplateQueryRepository } from '@modules/clinical/consent-form/domain/repositories/consent-template/consent-template.query.repository';
import { ConsentFormTemplate } from '@shared';
import { isNotUndefined } from '@common/utils/is-not-undefined';

@Injectable()
export class ConsentFormTemplateQueryRepository
  extends BaseRepository
  implements IConsentTemplateQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findById(id: string): Promise<ConsentFormTemplate | null> {
    return this.db.consentFormTemplate.findUnique({
      where: { id },
    });
  }

  async findMany(
    filter: FindConsentTemplatesFilter
  ): Promise<Paginated<ConsentFormTemplate>> {
    const where: Record<string, unknown> = { clinicId: filter.clinicId };
    if (isNotUndefined(filter.isActive)) where.isActive = filter.isActive;
    if (filter.sectorId) where.sectorId = filter.sectorId;

    return paginate({
      delegate: this.db.consentFormTemplate,
      pagination: filter.pagination,
      where,
    });
  }
}
