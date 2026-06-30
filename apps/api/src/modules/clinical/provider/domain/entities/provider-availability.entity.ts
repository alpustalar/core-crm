import { ProviderAvailability as IProviderAvailability } from '@model-schema/ProviderAvailabilitySchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import {
  CreateProviderAvailabilityProps,
  UpdateProviderAvailabilityProps,
} from '@modules/clinical/provider/domain/contracts/provider-availability.contracts';
import {
  BreakTimeOutOfRangeException,
  InvalidBreakTimeConfigurationException,
} from '@modules/clinical/provider/domain/exceptions/provider-availability.exceptions';
import { DateTimeManager } from '@src/common/infrastructure/date-time/date-time.manager';

export class ProviderAvailability
  extends AggregateRoot
  implements IProviderAvailability
{
  constructor(data: IProviderAvailability) {
    super();
    this._id = UUID.fromTrusted(data.id);
    this._providerId = UUID.fromTrusted(data.providerId);
    this._dayOfWeek = data.dayOfWeek;
    this._createdAt = data.createdAt;
    this._updatedAt = data.updatedAt;

    this._availabilityRange = DayMinuteRange.fromTrusted(
      data.startMinute,
      data.endMinute
    );

    this._breakRange =
      data.breakStartMinute != null && data.breakEndMinute != null
        ? DayMinuteRange.fromTrusted(data.breakStartMinute, data.breakEndMinute)
        : null;

    this.validate();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Private Properties & Getters
  // ────────────────────────────────────────────────────────────────────────────
  private _id: UUID;
  get id(): string {
    return this._id.value;
  }

  private _providerId: UUID;
  get providerId(): string {
    return this._providerId.value;
  }

  private _dayOfWeek: number;
  get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  private _availabilityRange: DayMinuteRange;
  get availabilityRange(): DayMinuteRange {
    return this._availabilityRange;
  }

  private _breakRange: DayMinuteRange | null;
  get breakRange(): DayMinuteRange | null {
    return this._breakRange;
  }

  get startMinute(): number {
    return this._availabilityRange.start.toNumber();
  }
  get endMinute(): number {
    return this._availabilityRange.end.toNumber();
  }
  get breakStartMinute(): number | null {
    return this._breakRange?.start.toNumber() ?? null;
  }
  get breakEndMinute(): number | null {
    return this._breakRange?.end.toNumber() ?? null;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }

  private _updatedAt: Date | null;
  get updatedAt(): Date | null {
    return this._updatedAt;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 🚀 Static Create Method (Factory)
  // ────────────────────────────────────────────────────────────────────────────
  public static create(
    props: CreateProviderAvailabilityProps
  ): ProviderAvailability {
    const providerId = UUID.create(props.providerId).orThrow();
    const availabilityRange = DayMinuteRange.fromNumbers(
      props.startMinute,
      props.endMinute
    );
    const breakRange =
      props.breakStartMinute != null && props.breakEndMinute != null
        ? DayMinuteRange.fromNumbers(
            props.breakStartMinute,
            props.breakEndMinute
          )
        : null;

    return new ProviderAvailability({
      id: props.id ?? UUID.generate().value,
      providerId: providerId.value,
      dayOfWeek: props.dayOfWeek,
      startMinute: availabilityRange.start.toNumber(),
      endMinute: availabilityRange.end.toNumber(),
      breakStartMinute: breakRange?.start.toNumber() ?? null,
      breakEndMinute: breakRange?.end.toNumber() ?? null,
      createdAt: DateTimeManager.create(),
      updatedAt: null,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Public Update Method
  // ────────────────────────────────────────────────────────────────────────────
  public update(props: UpdateProviderAvailabilityProps): void {
    const newAvailabilityRange = DayMinuteRange.fromNumbers(
      props.startMinute,
      props.endMinute
    );

    const newBreakRange =
      props.breakStartMinute != null && props.breakEndMinute != null
        ? DayMinuteRange.fromNumbers(
            props.breakStartMinute,
            props.breakEndMinute
          )
        : null;

    this._availabilityRange = newAvailabilityRange;
    this._breakRange = newBreakRange;

    this.validate();

    this._updatedAt = new Date();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Domain Validation & Helper

  // ────────────────────────────────────────────────────────────────────────────
  public toPersistence(): IProviderAvailability {
    return {
      id: this._id.value,
      providerId: this._providerId.value,
      dayOfWeek: this._dayOfWeek,
      startMinute: this.startMinute,
      endMinute: this.endMinute,
      breakStartMinute: this.breakStartMinute,
      breakEndMinute: this.breakEndMinute,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Mapping to Persistence

  // ────────────────────────────────────────────────────────────────────────────
  private validate(): void {
    const hasStart = this.breakStartMinute !== null;
    const hasEnd = this.breakEndMinute !== null;
    if (hasStart !== hasEnd) {
      throw new InvalidBreakTimeConfigurationException();
    }

    if (
      this._breakRange &&
      !this._breakRange.isCompletelyWithin(this._availabilityRange)
    ) {
      throw new BreakTimeOutOfRangeException(
        this._breakRange.start.toString(),
        this._breakRange.end.toString(),
        this._availabilityRange.start.toString(),
        this._availabilityRange.end.toString()
      );
    }
  }
}
