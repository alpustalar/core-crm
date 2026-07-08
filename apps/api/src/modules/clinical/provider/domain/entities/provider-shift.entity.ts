import { ProviderShift as IProviderShift } from '@model-schema/ProviderShiftSchema';
import { AggregateRoot } from '@common/domain/aggregate-root';
import { DayMinuteRange } from '@src/domain/value-objects/day-minute-range.vo';
import { CreateShiftProps } from '@modules/clinical/provider/domain/contracts/provider-shift.contracts';
import {
  AppointmentOutOfShiftException,
  AppointmentOverlapsWithBreakException,
  InvalidProviderBreakConfigurationException,
  ProviderBreakOutOfRangeException,
} from '@modules/clinical/provider/domain/exceptions/provider-shift.exceptions';
import { UUID } from '@src/domain/value-objects/uuid.vo';
import { DayMinute } from '@src/domain/value-objects/day-minute.vo';
import { isDefined } from '@common/utils';

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

      /**
       * Mola ve Vardiya Yapılandırma Kontrolü (Entity içi veya save öncesi için)
       *
       */
      breakConfiguration: () => {
        // 1. Eksik kurgu var mı? (Biri var biri yoksa patlar)
        const isConfigIncomplete =
          !!this.breakStartMinute !== !!this.breakEndMinute;

        // 2. Mola vardiyanın tamamen içinde mi?
        const isBreakWithinShift = this._breakRange
          ? this._breakRange.validate.isCompletelyWithIn(this._shiftRange).value
          : true;

        const isValid = !isConfigIncomplete && isBreakWithinShift;

        return {
          isValid,
          isInvalid: !isValid,
          orThrow: (): this => {
            if (isConfigIncomplete) {
              throw new InvalidProviderBreakConfigurationException();
            }
            if (!isBreakWithinShift && this._breakRange) {
              throw new ProviderBreakOutOfRangeException(
                this._breakRange.start.toString(),
                this._breakRange.end.toString(),
                this._shiftRange.start.toString(),
                this._shiftRange.end.toString()
              );
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
    const id = props.id
      ? UUID.create(props.id).orThrow().value
      : UUID.generate().value;

    const shiftStartMinute = DayMinute.fromNumber(props.startMinute);
    const shiftEndMinute = DayMinute.fromNumber(props.endMinute);

    const shiftMinuteRange = DayMinuteRange.create(
      shiftStartMinute,
      shiftEndMinute
    );

    let breakMinuteRange: DayMinuteRange | null = null;

    if (isDefined(props.breakStartMinute) && isDefined(props.breakEndMinute)) {
      const breakStartMinute = DayMinute.fromNumber(props.breakStartMinute);
      const breakEndMinute = DayMinute.fromNumber(props.breakEndMinute);
      breakMinuteRange = DayMinuteRange.create(
        breakStartMinute,
        breakEndMinute
      );
    }

    return new ProviderShift({
      id,
      providerId: UUID.create(props.providerId).orThrow().value,
      date: props.date,

      startMinute: shiftMinuteRange.start.value,
      endMinute: shiftMinuteRange.end.value,

      breakStartMinute: breakMinuteRange ? breakMinuteRange.start.value : null,
      breakEndMinute: breakMinuteRange ? breakMinuteRange.end.value : null,
    });
  }

  /**
   *  Vardiya saatlerini günceller.
   */
  public updateHours(
    newRange: DayMinuteRange,
    newBreakRange: DayMinuteRange | null
  ): void {
    this._shiftRange = newRange;
    this._breakRange = newBreakRange;
    this.validate.breakConfiguration().orThrow();
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
