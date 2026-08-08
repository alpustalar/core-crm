export interface DomainEventMetadata {
  correlationId: string;
  eventId: string;
  occurredAt: Date;
  version: number;
}

export interface DomainEvent<T = object> {
  name: string;
  payload: T;
  metadata: DomainEventMetadata;
}
