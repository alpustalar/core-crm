import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs'; // Değişiklik burada
import { PrismaService } from '@src/infrastructure/persistence/prisma/prisma.service';
import { TransactionContext, txStorage, } from '@src/infrastructure/persistence/prisma/transaction/als-storage';

@Injectable()
export class TransactionManager {
  constructor(
    private prisma: PrismaService,
    private eventBus: EventBus
  ) {}

  async run<T>(work: () => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      const context: TransactionContext = {
        tx,
        events: [],
        correlationId: crypto.randomUUID(),
      };

      const result = await txStorage.run(context, work);

      // Event Bus kullanımı
      for (const event of context.events) {
        await this.eventBus.publish(event.payload);
      }

      return result;
    });
  }
}
