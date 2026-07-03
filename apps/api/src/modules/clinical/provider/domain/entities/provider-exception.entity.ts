import { ProviderException as IProviderException } from '@model-schema/ProviderExceptionSchema';
import {
  ExceptionTypeSchema,
  ExceptionTypeType as ExceptionType,
} from '@input-type-schemas/ExceptionTypeSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DateRange } from '@src/domain/value-objects/date-range.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { CreateProviderExceptionProps } from '@modules/clinical/provider/domain/contracts/provider-exception.contracts';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { Guard } from '@common/domain/guards';

interface IProviderExceptionValidator {
  type: {
    isOff: Guard<boolean>;
    isOn: Guard<boolean>;
  };
}

export class ProviderException extends AggregateRoot {
  constructor(data: IProviderException) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._type = data.type;
    this._dateRange = DateRange.fromTrusted(data.startTime, data.endTime);
    this._reason = data.reason;
    this._providerId = UUID.fromTrusted(data.providerId);
    this._createdAt = data.createdAt;
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _startTime: Date;
  get startTime(): Date {
    return this._dateRange.startDate;
  }

  private _endTime: Date;
  get endTime(): Date {
    return this._dateRange.endDate;
  }
  private _type: ExceptionType;
  get type(): ExceptionType {
    return this._type;
  }

  private _dateRange: DateRange;
  get dateRange(): DateRange {
    return this._dateRange;
  }

  private _reason: string | null;
  get reason(): string | null {
    return this._reason;
  }

  private _providerId: UUID;
  get providerId(): UUID {
    return this._providerId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  public get validate(): IProviderExceptionValidator {
    return {
      type: { isOff: this.isOff, isOn: this.isOn },
    };
  }

  private get isOff() {
    const isOff = this._type === ExceptionTypeSchema.enum.OFF;
    return Guard.monitor(
      isOff,
      isOff,
      new Error('Uzman beklenmedik durumu "kapalı" değil')
    );
  }

  private get isOn() {
    const isOn = this._type === ExceptionTypeSchema.enum.ON;
    return Guard.monitor(
      isOn,
      isOn,
      new Error('Uzman beklenmedik durumu "açık" değil')
    );
  }

  public static create(props: CreateProviderExceptionProps): ProviderException {
    const id = props.id ? UUID.create(props.id).orThrow() : UUID.generate();

    const providerId = UUID.create(props.providerId).orThrow();

    const dateRange = DateRange.create(
      props.startTime,
      props.endTime
    ).orThrow();

    const now = DateTimeManager.create();

    return new ProviderException({
      id: id.value,
      providerId: providerId.value,
      type: props.type,
      startTime: dateRange.startDate,
      endTime: dateRange.endDate,
      reason: props.reason ?? null,
      createdAt: now,
    });
  }

  public toPersistence(): IProviderException {
    return {
      id: this._id.value,
      type: this._type,
      startTime: this._dateRange.startDate,
      endTime: this._dateRange.endDate,
      reason: this._reason,
      providerId: this._providerId.value,
      createdAt: this._createdAt,
    };
  }
}
