import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPartyCommandRepository } from '@modules/finance/party/domain/repositories/party.repository';
import { Party } from '@modules/finance/party/domain/entities/party.entity';

@Injectable()
export class PartyCommandRepository
  extends BaseRepository
  implements IPartyCommandRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(party: Party): Promise<Party> {
    const data = party.toPersistence();
    const raw = await this.db.party.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
    party.flushEvents();
    return new Party(raw);
  }
}
