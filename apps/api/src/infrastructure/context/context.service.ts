import { Injectable } from '@nestjs/common';
import { txStorage } from '../transaction/als-storage';

@Injectable()
export class ContextService {
  addEvent(name: string, eventInstance: object): void {
    const store = txStorage.getStore();
    if (store) {
      store.events.push({
        name,
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
