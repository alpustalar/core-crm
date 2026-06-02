import { txStorage } from '@src/infrastructure/persistence/prisma/transaction';
import { IAuditLog } from '@common/interfaces/audit-log.interface';

export interface EventMetadata {
  eventId: string;
  correlationId: string;
  occurredAt: Date;
  version: number; // Yarın bir gün event yapısı değişirse hayat kurtarır
}

const getContextCorrelationId = (): string => {
  const store = txStorage.getStore();
  return store?.correlationId ?? crypto.randomUUID();
};

export abstract class BaseEvent {
  static readonly NAME: string;

  public readonly metadata: EventMetadata;
  public readonly log?: IAuditLog;

  constructor(log?: IAuditLog) {
    this.metadata = {
      eventId: crypto.randomUUID(),
      correlationId: getContextCorrelationId(),
      occurredAt: new Date(),
      version: 1,
    };
    this.log = log;
  }
}
