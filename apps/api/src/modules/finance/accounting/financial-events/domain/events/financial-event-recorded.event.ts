import { BaseEvent } from '@common/interfaces';
import { FINANCIAL_EVENT_EVENTS } from '@src/domain/constants/events';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';

export interface FinancialEventRecordedPayload {
  financialEventId: string;
  organizationId: string;
  type: FinancialEventType;
}

/**
 * Bir ekonomik olay kalıcı olarak yazıldığında raise edilir.
 * Posting modülündeki listener bunu yakalayıp fişi (JournalEntry) üretir.
 * Audit log değildir → BaseEvent'e log geçilmez.
 */
export class FinancialEventRecordedEvent extends BaseEvent {
  static readonly NAME = FINANCIAL_EVENT_EVENTS.RECORDED;

  public readonly financialEventId: string;
  public readonly organizationId: string;
  public readonly type: FinancialEventType;

  constructor(payload: FinancialEventRecordedPayload) {
    super();
    this.financialEventId = payload.financialEventId;
    this.organizationId = payload.organizationId;
    this.type = payload.type;
  }
}
