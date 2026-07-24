import { ProviderShift as IProviderShift } from '@model-schema/ProviderShiftSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import {
  CreateShiftProps,
  UpdateHoursAndDateProps,
} from '@modules/clinical/provider/domain/contracts/provider-shift.contracts';
import {
  AppointmentOutOfShiftException,
  AppointmentOverlapsWithBreakException,
} from '@modules/clinical/provider/domain/exceptions/provider-shift.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DayMinute } from '@src/domain/value-objects/day-minute.vo';
import { DateTimeManager, isDefined } from '@common/utils';
import { ProviderShiftRules } from '@modules/clinical/provider/domain/rules/provider-shift.rules';
import { ValidateOptionsType } from '@shared/common/validate-options/validate-options.type';

export class ProviderShift extends AggregateRoot {
  constructor(data: IProviderShift) {
    super();
    this._id = UUID.fromTrusted(data.id);

    this._providerId = UUID.fromTrusted(data.providerId);
    this._date = data.date;

    this._shiftRange = DayMinuteRange.fromNumbers(
      data.startMinute,
      data.endMinute
    );

    if (isDefined(data.breakStartMinute) && isDefined(data.breakEndMinute)) {
      this._breakRange = DayMinuteRange.fromNumbers(
        data.breakStartMinute,
        data.breakEndMinute
      );
    }
  }

  private _id: UUID;
  get id(): UUID {
    return this._id;
  }

  private _providerId: UUID;
  get providerId(): UUID {
    return this._providerId;
  }

  private _date: Date;
  get date(): Date {
    return this._date;
  }

  private _shiftRange: DayMinuteRange;
  get shiftRange(): DayMinuteRange {
    return this._shiftRange;
  }

  private _breakRange: DayMinuteRange | null;
  get breakRange(): DayMinuteRange | null {
    return this._breakRange;
  }

  // Şema ve dış katman uyumluluğu (Legacy/Prisma mapping) için ham dakikalar
  get startMinute(): number {
    return this._shiftRange.start.toNumber();
  }
  get endMinute(): number {
    return this._shiftRange.end.toNumber();
  }
  get breakStartMinute(): number | null {
    return this._breakRange?.start.toNumber() ?? null;
  }
  get breakEndMinute(): number | null {
    return this._breakRange?.end.toNumber() ?? null;
  }

  public get validate() {
    return {
      canBook: (requestedRange: DayMinuteRange) => {
        // 1. Kural: Vardiya saatleri içinde mi?
        const isWithinShift = requestedRange.validate.isCompletelyWithIn(
          this._shiftRange
        ).value;

        // 2. Kural: Mola saatleriyle çakışıyor mu?
        const overlapsWithBreak = !!(
          this._breakRange &&
          requestedRange.validate.overlapsWith(this._breakRange).value
        );

        const isValid = isWithinShift && !overlapsWithBreak;

        return {
          isValid,
          isInvalid: !isValid,
          orThrow: (): this => {
            if (!isWithinShift) {
              throw new AppointmentOutOfShiftException(
                this._shiftRange.start.toNumber(),
                this._shiftRange.end.toNumber()
              );
            }
            if (overlapsWithBreak) {
              throw new AppointmentOverlapsWithBreakException();
            }
            return this;
          },
        };
      },
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Domain Logic & Validations
  // ────────────────────────────────────────────────────────────────────────────

  // ────────────────────────────────────────────────────────────────────────────
  public static create(props: CreateShiftProps): ProviderShift {
    const shiftStartMinute = DayMinute.fromNumber(props.startMinute);
    const shiftEndMinute = DayMinute.fromNumber(props.endMinute);

    const shiftMinuteRange = DayMinuteRange.create(
      shiftStartMinute.orThrow(),
      shiftEndMinute.orThrow()
    ).orThrow();

    let breakMinuteRange: DayMinuteRange | null = null;

    if (isDefined(props.breakStartMinute) && isDefined(props.breakEndMinute)) {
      const breakStartMinute = DayMinute.fromNumber(props.breakStartMinute);
      const breakEndMinute = DayMinute.fromNumber(props.breakEndMinute);
      breakMinuteRange = DayMinuteRange.create(
        breakStartMinute.orThrow(),
        breakEndMinute.orThrow()
      ).orThrow();
    }

    return new ProviderShift({
      id: UUID.createOrGenerate(props.id).value,
      providerId: UUID.create(props.providerId).orThrow().value,
      date: props.date,

      startMinute: shiftMinuteRange.start.value,
      endMinute: shiftMinuteRange.end.value,

      breakStartMinute: breakMinuteRange ? breakMinuteRange.start.value : null,
      breakEndMinute: breakMinuteRange ? breakMinuteRange.end.value : null,
    });
  }

  public rules(validateOptions: ValidateOptionsType) {
    return new ProviderShiftRules(this, validateOptions);
  }

  /**
   *  Vardiya saatlerini günceller.
   */
  public updateHoursAndDate(props: UpdateHoursAndDateProps): void {
    const start = props.startMinute ?? this.startMinute;
    const end = props.endMinute ?? this.endMinute;

    const breakStart = props.breakStartMinute ?? this.breakStartMinute;
    const breakEnd = props.breakEndMinute ?? this.breakEndMinute;

    const date = DateTimeManager.create(props.date);

    if (isDefined(start) && isDefined(end)) {
      const startDayMinute =
        typeof start === 'number'
          ? DayMinute.fromNumber(start)
          : DayMinute.fromString(start);

      const endDayMinute =
        typeof end === 'number'
          ? DayMinute.fromNumber(end)
          : DayMinute.fromString(end);

      this._shiftRange = DayMinuteRange.create(
        startDayMinute.orThrow(),
        endDayMinute.orThrow()
      ).orThrow();
    }

    if (isDefined(breakStart) && isDefined(breakEnd)) {
      const breakStartDayMinute =
        typeof breakStart === 'number'
          ? DayMinute.fromNumber(breakStart)
          : DayMinute.fromString(breakStart);

      const breakEndDayMinute =
        typeof breakEnd === 'number'
          ? DayMinute.fromNumber(breakEnd)
          : DayMinute.fromString(breakEnd);

      this._breakRange = DayMinuteRange.create(
        breakStartDayMinute.orThrow(),
        breakEndDayMinute.orThrow()
      ).orThrow();
    }

    if (isDefined(date)) this._date = date;
  }

  // ────────────────────────────────────────────────────────────────────────────
  public toPersistence(): IProviderShift {
    return {
      id: this.id.value,
      providerId: this.providerId.value,
      date: this.date,
      startMinute: this.startMinute,
      endMinute: this.endMinute,
      breakStartMinute: this.breakStartMinute,
      breakEndMinute: this.breakEndMinute,
    };
  }
}
