import { ProviderException as IProviderException } from '@model-schema/ProviderExceptionSchema';
import {
  ExceptionTypeSchema,
  ExceptionTypeType as ExceptionType,
} from '@input-type-schemas/ExceptionTypeSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DateRange } from '@src/domain/value-objects/date-range.vo';

export class ProviderException
  extends AggregateRoot
  implements IProviderException
{
  constructor(data: IProviderException) {
    super();
    this._id = data.id;
    this._type = data.type;
    this._dateRange = DateRange.create(data.startTime, data.endTime).orThrow();
    this._reason = data.reason;
    this._providerId = data.providerId;
    this._createdAt = data.createdAt;
  }

  private _id: string;
  get id(): string {
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

  private _providerId: string;
  get providerId(): string {
    return this._providerId;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  isOff(): boolean {
    return this._type === ExceptionTypeSchema.enum.OFF;
  }

  isOn(): boolean {
    return this._type === ExceptionTypeSchema.enum.ON;
  }

  public toPersistence(): IProviderException {
    return {
      id: this._id,
      type: this._type,
      startTime: this._dateRange.startDate,
      endTime: this._dateRange.endDate,
      reason: this._reason,
      providerId: this._providerId,
      createdAt: this._createdAt,
    };
  }
}
