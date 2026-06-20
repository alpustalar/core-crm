import { Injectable } from '@nestjs/common';
import { PartyOriginType, Prisma } from '@prisma/client';
import { Pagination } from '@shared';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { paginate } from '@src/infrastructure/persistence/prisma/helpers/paginate.helper';
import { IPartyQueryRepository } from '@modules/finance/party/domain/repositories/party.repository';
import { Party } from '@modules/finance/party/domain/entities/party.entity';
import { FindPartiesFilter } from '@modules/finance/party/domain/party.contracts';

@Injectable()
export class PartyQueryRepository
  extends BaseRepository
  implements IPartyQueryRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(id: string): Promise<Party | null> {
    const raw = await this.db.party.findUnique({ where: { id } });
    return raw ? new Party(raw) : null;
  }

  async findByOrigin(
    clinicId: string,
    originType: PartyOriginType,
    originId: string
  ): Promise<Party | null> {
    const raw = await this.db.party.findUnique({
      where: {
        clinicId_originType_originId: {
          clinicId,
          originType,
          originId,
        },
      },
    });
    return raw ? new Party(raw) : null;
  }

  async findMany(
    filter: FindPartiesFilter,
    pagination: Pagination
  ): Promise<{ items: Party[]; total: number }> {
    const where: Prisma.PartyWhereInput = {
      organizationId: filter.organizationId,
      ...(filter.role ? { roles: { has: filter.role } } : {}),
      ...(filter.isActive !== undefined ? { isActive: filter.isActive } : {}),
    };

    const result = await paginate({
      delegate: this.db.party,
      pagination,
      where,
    });

    return {
      items: result.items.map((raw) => new Party(raw)),
      total: result.total,
    };
  }
}
