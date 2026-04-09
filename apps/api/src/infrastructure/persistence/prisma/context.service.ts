import { Injectable } from '@nestjs/common';
import { txStorage } from './als-storage';

@Injectable()
export class ContextService {
  addEvent(name: string, eventInstance: unknown): void {
    const store = txStorage.getStore();
    if (store) {
      store.events.push({
        name,
        payload: eventInstance,
        occurredAt: new Date(),
      });
    }
  }
}
