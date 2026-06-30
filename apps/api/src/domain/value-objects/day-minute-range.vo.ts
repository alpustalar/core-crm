import { DayMinute } from '@src/domain/value-objects/day-minute.vo';
import { InvalidDayMinuteRangeException } from '@src/domain/exceptions/vo/day-minute-range.exceptions';
import { Guard } from '@common/domain/guards';

export class DayMinuteRange {
  private constructor(
    public readonly start: DayMinute,
    public readonly end: DayMinute,
    trusted = false
  ) {
    if (!trusted && (start.isAfter(end) || start.equals(end))) {
      throw new InvalidDayMinuteRangeException(Number(start), Number(end));
    }
  }

  /** Toplam aralık süresini dakika cinsinden verir */
  public get durationMinutes(): number {
    return this.end.toNumber() - this.start.toNumber();
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) dakika değerlerinden doğrudan aralık üretir;
   * sıra doğrulamasını atlar. Sadece güvendiğin (persisted) veride kullan.
   */
  public static fromTrusted(
    startMinute: number,
    endMinute: number
  ): DayMinuteRange {
    return new DayMinuteRange(
      DayMinute.fromTrusted(startMinute),
      DayMinute.fromTrusted(endMinute),
      true
    );
  }

  /** Sıfırdan bir aralık nesnesi üretir */
  public static create(start: DayMinute, end: DayMinute): DayMinuteRange {
    return new DayMinuteRange(start, end);
  }

  /** Saf sayılardan hızlıca aralık üretir */
  public static fromNumbers(
    startMinute: number,
    endMinute: number
  ): DayMinuteRange {
    return new DayMinuteRange(
      DayMinute.fromNumber(startMinute),
      DayMinute.fromNumber(endMinute)
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  //  Matris Geometrisi ve Çakışma Analizleri
  // ────────────────────────────────────────────────────────────────────────────

  /** * Verilen bir dakikanın bu aralığın içinde (veya sınırlarında) olup olmadığını söyler.
   * [start, end) -> Genelde randevularda bitiş saati dahil edilmez (Exclusive).
   */

  public check(other: DayMinuteRange, errorMessage: string) {
    return {
      isCompletelyWithin: this.isCompletelyWithin(other, errorMessage),
      overlapsWith: this.overlapsWith(other, errorMessage),
    };
  }

  public contains(minute: DayMinute): boolean {
    return (
      (minute.isAfter(this.start) || minute.equals(this.start)) &&
      minute.isBefore(this.end)
    );
  }

  /** * Başka bir aralığın, bu aralığın tamamen içinde kalıp kalmadığını kontrol eder.
   * Örn: Randevu, Vardiyanın içinde mi?
   */
  public isCompletelyWithin(
    other: DayMinuteRange,
    errorMessage?: string
  ): Guard<boolean> {
    const isValid =
      (this.start.isAfter(other.start) || this.start.equals(other.start)) &&
      (this.end.isBefore(other.end) || this.end.equals(other.end));

    return Guard.monitor(isValid, isValid, new Error(errorMessage));
  }

  /** * Başka bir aralıkla herhangi bir şekilde çakışma (Overlap) var mı?
   * Takvimde çift randevu yazılmasını engellemek için kullanılan kutsal formül.
   */
  public overlapsWith(
    other: DayMinuteRange,
    errorMessage?: string
  ): Guard<boolean> {
    const isValid =
      this.start.isBefore(other.end) && other.start.isBefore(this.end);
    return Guard.monitor(isValid, isValid, new Error(errorMessage));
  }
}
