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

  // ────────────────────────────────────────────────────────────────────────────
  //  Matris Geometrisi ve Çakışma Analizleri
  // ────────────────────────────────────────────────────────────────────────────

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

  private contains(minute: DayMinute, errorMessage?: string) {
    const isContained =
      (minute.isAfter(this.start) || minute.equals(this.start)) &&
      minute.isBefore(this.end);

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
      (this.start.isAfter(other.start) || this.start.equals(other.start)) &&
      (this.end.isBefore(other.end) || this.end.equals(other.end));

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
      this.start.isBefore(other.end) && other.start.isBefore(this.end);
    const isValid = !hasOverlap;

    // 🚀 Dinamik Varsayılan Mesaj: Örn: "[Takvim Çakışması] [540 - 600) aralığı, mevcut [580 - 640) aralığı ile çakışıyor."
    const defaultMessage = `[Takvim Çakışması] Mevcut [${this.start.toNumber()} - ${this.end.toNumber()}) aralığı, hedef [${other.start.toNumber()} - ${other.end.toNumber()}) aralığı ile çakışıyor.`;

    return Guard.monitor(
      isValid,
      isValid,
      () => new Error(errorMessage ?? defaultMessage)
    );
  }
}
