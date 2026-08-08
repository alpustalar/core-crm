import { txStorage } from '@src/infrastructure/transaction/als-storage';
import { BaseEvent } from '@common/interfaces/base-event.interface';

export abstract class AggregateRoot {
  private _domainEvents: BaseEvent[] = [];

  protected addDomainEvent(event: BaseEvent): void {
    this._domainEvents.push(event);
  }

  getDomainEvents(): BaseEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  flushEvents(): void {
    const store = txStorage.getStore();
    if (!store) {
      this._domainEvents = [];
      return;
    }
    for (const event of this._domainEvents) {
      const ctor = (event as any)?.constructor;
      const name: string = ctor?.NAME ?? ctor?.name ?? 'UnknownEvent';
      store.events.push({ name, payload: event, metadata: event.metadata });
    }
    this._domainEvents = [];
  }
}
