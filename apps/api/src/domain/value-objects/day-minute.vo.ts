import {
  DayMinuteOutOfRangeException,
  InvalidTimeFormatException,
  InvalidTimeValueException,
} from '@src/domain/exceptions/vo/day-minute.exceptions';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';

export class DayMinute {
  private constructor(minute: number, trusted = false) {
    if (!trusted && (minute < 0 || minute > 1440)) {
      throw new DayMinuteOutOfRangeException(minute);
    }
    this._value = minute;
  }

  private _value: number;

  get value(): number {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) dakika değerinden doğrudan VO üretir; aralık
   * doğrulamasını atlar. Sadece güvendiğin (persisted) veride kullan.
   */
  public static fromTrusted(minute: number): DayMinute {
    return new DayMinute(minute, true);
  }

  /** Saf sayıdan VO üretir: DayMinute.fromNumber(540) -> 09:00 */
  public static fromNumber(minute: number): DayMinute {
    return new DayMinute(minute);
  }

  public static fromDate(date: Date): DayMinute {
    return new DayMinute(DateTimeManager.getDayMinutes(date));
  }

  /** metinden ("09:30") VO üretir: DayMinute.fromString("09:30") -> 570 */
  public static fromString(timeString: string): DayMinute {
    const parts = timeString.split(':');
    if (parts.length !== 2) {
      throw new InvalidTimeFormatException(timeString);
    }
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      throw new InvalidTimeValueException(timeString);
    }

    return new DayMinute(hours * 60 + minutes);
  }

  public toNumber(): number {
    return this._value;
  }

  /** VO'yu saate çevirir: 570 -> "09:30" (WhatsApp mesajlarında veya UI'da direkt kullanılır) */
  public toString(): string {
    const totalMinutes = this._value ?? 0;
    return DateTimeManager.minutesToHHMM(totalMinutes);
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Karşılaştırma ve Hesaplama Fonksiyonları (İş Mantığı Kolaylaştırıcıları)
  // ────────────────────────────────────────────────────────────────────────────

  public isAfter(other: DayMinute): boolean {
    return this._value > other.toNumber();
  }

  public isBefore(other: DayMinute): boolean {
    return this._value < other.toNumber();
  }

  // 🎯 Küçük veya Eşit (Less Than or Equal) -> isBeforeOrEqual
  public isBeforeOrEqual(other: DayMinute): boolean {
    return this._value <= other.value;
  }

  // 🎯 Büyük veya Eşit (Greater Than or Equal) -> isAfterOrEqual
  public isAfterOrEqual(other: DayMinute): boolean {
    return this._value >= other.value;
  }

  public equals(other: DayMinute): boolean {
    return this._value === other.toNumber();
  }

  /** İki zaman arasındaki farkı dakika olarak döner */
  public differenceInMinutes(other: DayMinute): number {
    return Math.abs(this._value - other.toNumber());
  }
}
