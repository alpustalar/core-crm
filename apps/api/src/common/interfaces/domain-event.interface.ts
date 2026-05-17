export interface DomainEvent {
  payload: object;
  occurredAt: Date;
  correlationId: string;
}
