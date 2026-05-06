import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TransactionContext,
  txStorage,
} from '@src/infrastructure/persistence/prisma/als-storage';

@Injectable()
export class TransactionManager {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
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
}
