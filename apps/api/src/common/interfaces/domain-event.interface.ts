export interface IDomainEvent {
  name: string;
  payload: any;
  occurredAt: Date;
}
