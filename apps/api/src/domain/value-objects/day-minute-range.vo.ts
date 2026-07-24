import { DayMinute } from '@src/domain/value-objects/day-minute.vo';
import { Guard } from '@common/domain/guards';
import { InvalidDayMinuteRangeException } from '@src/domain/exceptions';

export class DayMinuteRange {
  private constructor(
    private readonly _start: DayMinute,
    private readonly _end: DayMinute
  ) {
    Object.freeze(this);
  }

  /** Toplam aralık süresini dakika cinsinden verir */
  public get durationMinutes(): number {
    return this.end.toNumber() - this.start.toNumber();
  }

  /** * Verilen bir dakikanın bu aralığın içinde (veya sınırlarında) olup olmadığını söyler.
   * [start, end) -> Genelde randevularda bitiş saati dahil edilmez (Exclusive).
   */

  public get validate() {
    return {
      isCompletelyWithIn: (other: DayMinuteRange, errorMessage?: string) =>
        this.isCompletelyWithin(other, errorMessage),
      overlapsWith: (other: DayMinuteRange, errorMessage?: string) =>
        this.overlapsWith(other, errorMessage),
      contains: (minute: DayMinute, errorMessage?: string) =>
        this.contains(minute, errorMessage),
    };
  }

  public get start() {
    return this._start;
  }

  public get end() {
    return this._end;
  }

  public static fromTrusted(
    startMinute: number,
    endMinute: number
  ): DayMinuteRange {
    const _startMinute = DayMinute.fromTrusted(startMinute);
    const _endMinute = DayMinute.fromTrusted(endMinute);

    return new DayMinuteRange(_startMinute, _endMinute);
  }

  /** Sıfırdan bir aralık nesnesi üretir */
  public static create(start: DayMinute, end: DayMinute) {
    const isValid = start.validate.isBefore(end).value;

    const instance = isValid ? new DayMinuteRange(start, end) : undefined;

    return {
      instance,
      orThrow(exception?: Error): DayMinuteRange {
        if (!instance) {
          throw (
            exception ??
            new InvalidDayMinuteRangeException(start.toNumber(), end.toNumber())
          );
        }
        return instance;
      },
    };
  }

  /** Saf sayılardan hızlıca aralık üretir */
  public static fromNumbers(
    startMinute: number,
    endMinute: number
  ): DayMinuteRange {
    return new DayMinuteRange(
      DayMinute.fromTrusted(startMinute),
      DayMinute.fromTrusted(endMinute)
    );
  }

  private contains(minute: DayMinute, errorMessage?: string) {
    const isContained =
      (minute.validate.isAfter(this.start).value ||
        minute.validate.isEquals(this.start).value) &&
      minute.validate.isBefore(this.end).value;

    // 🚀 Dinamik Varsayılan Mesaj: Örn: "Belirtilen dakika (630) zaman aralığının [540 - 600) dışında kalıyor."
    const defaultMessage = `[Zaman İhlali] Belirtilen dakika (${minute.toNumber()}) geçerli zaman aralığının [${this.start.toNumber()} - ${this.end.toNumber()}) dışında kalıyor.`;

    return Guard.monitor(
      isContained,
      isContained,
      () => new Error(errorMessage ?? defaultMessage)
    );
  }

  /**
   * Başka bir aralığın, bu aralığın tamamen içinde kalıp kalmadığını doğrular. (Örn: Randevu, Vardiyanın içinde mi?)
   */
  private isCompletelyWithin(
    other: DayMinuteRange,
    errorMessage?: string
  ): Guard<boolean> {
    const isValid =
      (this.start.validate.isAfter(other.start).value ||
        this.start.validate.isEquals(other.start).value) &&
      (this.end.validate.isBefore(other.end).value ||
        this.end.validate.isEquals(other.end).value);

    // 🚀 Dinamik Varsayılan Mesaj: Örn: "[Zaman Aşımı] Talep edilen [600 - 660) aralığı, izin verilen ana [540 - 630) sınırlarının dışına taşıyor."
    const defaultMessage = `[Zaman Aşımı] Talep edilen [${this.start.toNumber()} - ${this.end.toNumber()}) aralığı, izin verilen ana [${other.start.toNumber()} - ${other.end.toNumber()}) sınırlarının dışına taşıyor.`;

    return Guard.monitor(
      isValid,
      isValid,
      () => new Error(errorMessage ?? defaultMessage)
    );
  }

  /**
   * Başka bir aralıkla herhangi bir şekilde çakışma (Overlap) var mı doğrular.
   */
  private overlapsWith(
    other: DayMinuteRange,
    errorMessage?: string
  ): Guard<boolean> {
    const hasOverlap =
      this.start.validate.isBefore(other.end).value &&
      other.start.validate.isBefore(this.end).value;
    const isValid = !hasOverlap;

    const defaultMessage = `[Takvim Çakışması] Mevcut [${this.start.toNumber()} - ${this.end.toNumber()}) aralığı, hedef [${other.start.toNumber()} - ${other.end.toNumber()}) aralığı ile çakışıyor.`;

    return Guard.monitor(
      isValid,
      isValid,
      () => new Error(errorMessage ?? defaultMessage)
    );
  }
}
