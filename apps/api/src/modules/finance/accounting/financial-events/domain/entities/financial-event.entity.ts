import { FinancialEvent as IFinancialEvent } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { FinancialEventRecordedEvent } from '../events/financial-event-recorded.event';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { RecordFinancialEventProps } from '@modules/finance/accounting/financial-events/domain/financial-events.contracts';

/**
 * Değişmez (append-only) ekonomik olay. Bir kez yazılır, asla güncellenmez.
 * Posting bunu okuyup çift taraflı fişe çevirir.
 */
export class FinancialEvent extends AggregateRoot implements IFinancialEvent {
  constructor(data: IFinancialEvent) {
    super();
    this._id = data.id;
    this._organizationId = data.organizationId;
    this._clinicId = data.clinicId;
    this._type = data.type;
    this._occurredAt = data.occurredAt;
    this._payload = data.payload;
    this._sourceModule = data.sourceModule;
    this._sourceRefId = data.sourceRefId;
    this._dedupeKey = data.dedupeKey;
    this._performedById = data.performedById;
    this._createdAt = data.createdAt;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }

  private _clinicId: string;
  get clinicId(): string {
    return this._clinicId;
  }

  private _type: FinancialEventType;
  get type(): FinancialEventType {
    return this._type;
  }

  private _occurredAt: Date;
  get occurredAt(): Date {
    return this._occurredAt;
  }

  private _payload: JsonValue;
  get payload(): JsonValue {
    return this._payload;
  }

  private _sourceModule: string;
  get sourceModule(): string {
    return this._sourceModule;
  }

  private _sourceRefId: string | null;
  get sourceRefId(): string | null {
    return this._sourceRefId;
  }

  private _dedupeKey: string | null;
  get dedupeKey(): string | null {
    return this._dedupeKey;
  }

  private _performedById: string | null;
  get performedById(): string | null {
    return this._performedById;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  public static record(props: RecordFinancialEventProps): FinancialEvent {
    const event = new FinancialEvent({
      id: props.id ?? crypto.randomUUID(),
      organizationId: props.organizationId,
      clinicId: props.clinicId,
      type: props.type,
      occurredAt: props.occurredAt ?? new Date(),
      payload: props.payload as JsonValue,
      sourceModule: props.sourceModule,
      sourceRefId: props.sourceRefId ?? null,
      dedupeKey: props.dedupeKey ?? null,
      performedById: props.performedById ?? null,
      createdAt: new Date(),
    });

    // Posting'i tetikleyen domain event'i raise et (yalnızca yeni kayıtta).
    event.addDomainEvent(
      new FinancialEventRecordedEvent({
        financialEventId: event._id,
        organizationId: event._organizationId,
        type: event._type,
      })
    );

    return event;
  }

  public toPersistence(): IFinancialEvent {
    return {
      id: this._id,
      organizationId: this._organizationId,
      clinicId: this._clinicId,
      type: this._type,
      occurredAt: this._occurredAt,
      payload: this._payload,
      sourceModule: this._sourceModule,
      sourceRefId: this._sourceRefId,
      dedupeKey: this._dedupeKey,
      performedById: this._performedById,
      createdAt: this._createdAt,
    };
  }
}
