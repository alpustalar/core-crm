import { Injectable } from '@nestjs/common';
import { txStorage } from '../persistence/prisma/transaction/als-storage';

@Injectable()
export class ContextService {
  addEvent(eventInstance: object): void {
    const store = txStorage.getStore();
    if (store) {
      store.events.push({
        payload: eventInstance,
        occurredAt: new Date(),
        correlationId: store.correlationId,
      });
    }
  }

  getCorrelationId(): string {
    const store = txStorage.getStore();
    if (!store?.correlationId) {
      return crypto.randomUUID();
    }
    return store.correlationId;
  }
}
