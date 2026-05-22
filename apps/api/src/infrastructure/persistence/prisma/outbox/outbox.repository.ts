import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DomainEvent } from '@common/interfaces';
import { BaseRepository } from '@src/infrastructure/persistence/prisma/base.repository';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class OutboxRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async saveEvents(events: DomainEvent[]): Promise<void> {
    await this.db.outbox.createMany({
      data: events.map((event) => ({
        type: event.name,
        payload: event.payload as Prisma.InputJsonValue,
      })),
    });
  }
}
