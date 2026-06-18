import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { IPartyCommandRepository } from '@modules/finance/party/domain/repositories/party.repository';
import { Party } from '@modules/finance/party/domain/entities/party.entity';
import { PartyAlreadyExistsError } from '@modules/finance/party/domain/errors/party.errors';

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
    try {
      const raw = await this.db.party.upsert({
        where: { id: data.id },
        create: data,
        update: data,
      });
      party.flushEvents();
      return new Party(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new PartyAlreadyExistsError();
      }
      throw error;
    }
  }
}
