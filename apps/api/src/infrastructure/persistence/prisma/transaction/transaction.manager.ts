import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { TransactionContext, txStorage } from '@src/infrastructure/persistence/prisma/transaction/als-storage';
import { OutboxRepository } from '@src/infrastructure/persistence/prisma/outbox/outbox.repository';

@Injectable()
export class TransactionManager {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private outboxRepo: OutboxRepository,
  ) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    const existing = txStorage.getStore();
    if (existing?.tx) {
      return work();
    }

    return await this.prisma.$transaction(async (tx) => {
      const context: TransactionContext = {
        tx,
        events: [],
        correlationId: crypto.randomUUID(),
      };

      const result = await txStorage.run(context, work);

      for (const event of context.events) {
        await this.eventEmitter.emitAsync(event.name, event.payload);
      }

      return result;
    });
  }

  async outboxRun<T>(work: () => Promise<T>): Promise<T> {
    const existing = txStorage.getStore();
    if (existing?.tx) {
      return work();
    }

    return await this.prisma.$transaction(async (tx) => {
      const context: TransactionContext = {
        tx,
        events: [],
        correlationId: crypto.randomUUID(),
      };

      const result = await txStorage.run(context, work);

      if (context.events.length > 0) {
        await this.outboxRepo.saveEvents(context.events);
      }

      return result;
    });
  }
}
