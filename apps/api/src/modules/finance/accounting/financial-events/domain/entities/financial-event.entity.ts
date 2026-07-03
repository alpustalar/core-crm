import { FinancialEvent as IFinancialEvent } from '@shared';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { FinancialEventRecordedEvent } from '../events/financial-event-recorded.event';
import { FinancialEventTypeType as FinancialEventType } from '@input-type-schemas/FinancialEventTypeSchema';
import { JsonValueType as JsonValue } from '@input-type-schemas/JsonValueSchema';
import { RecordFinancialEventProps } from '@modules/finance/accounting/financial-events/domain/financial-events.contracts';
import { UUID } from '@src/domain/value-objects/uuid.vo';

/**
 * Değişmez (append-only) ekonomik olay. Bir kez yazılır, asla güncellenmez.
 * Posting bunu okuyup çift taraflı fişe çevirir.
 */
export class FinancialEvent extends AggregateRoot {
  constructor(data: IFinancialEvent) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._organizationId = UUID.fromTrusted(data.organizationId);
    this._clinicId = UUID.fromTrusted(data.clinicId);
    this._type = data.type;
    this._occurredAt = data.occurredAt;
    this._payload = data.payload;
    this._sourceModule = data.sourceModule;
    this._sourceRefId = data.sourceRefId;
    this._dedupeKey = data.dedupeKey;
    this._performedById = data.performedById;
    this._createdAt = data.createdAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _organizationId: UUID;
  get organizationId(): UUID {
    return this._organizationId;
  }

  private _clinicId: UUID;
  get clinicId(): UUID {
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

  /**
   * (New Record): İlk kez yeni bir finansal olay kaydederken çağrılır.
   */
  public static record(props: RecordFinancialEventProps): FinancialEvent {
    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();
    const organizationId = UUID.create(props.organizationId).orThrow();
    const clinicId = UUID.create(props.clinicId).orThrow();

    const now = new Date();

    const event = new FinancialEvent({
      id: id.value,
      organizationId: organizationId.value,
      clinicId: clinicId.value,
      type: props.type,
      occurredAt: props.occurredAt ?? now,
      payload: props.payload as JsonValue,
      sourceModule: props.sourceModule,
      sourceRefId: props.sourceRefId ?? null,
      dedupeKey: props.dedupeKey ?? null,
      performedById: props.performedById ?? null,
      createdAt: now,
    });

    // 🚀 Çift taraflı fiş (Posting) mekanizmasını tetikleyen domain event
    event.addDomainEvent(
      new FinancialEventRecordedEvent({
        financialEventId: event.id.value,
        organizationId: event.organizationId.value,
        type: event.type,
      })
    );

    return event;
  }

  public toPersistence(): IFinancialEvent {
    return {
      id: this._id.value,
      organizationId: this._organizationId.value,
      clinicId: this._clinicId.value,
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
