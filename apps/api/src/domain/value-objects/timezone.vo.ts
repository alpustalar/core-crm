import dayjs from 'dayjs';
import { TimeZoneType } from '@input-type-schemas/TimeZoneSchema';
import { TimeZoneSchema } from '@shared';
import { InvalidTimeZoneException } from '@src/domain/exceptions/vo/timezone.exceptions';

export class TimeZone {
  private readonly _value: TimeZoneType;

  // Constructor sadece %100 doğrulanmış ve formatlanmış veriyi bağlar
  private constructor(value: TimeZoneType) {
    this._value = value;
    Object.freeze(this);
  }

  public get value(): TimeZoneType {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) zaman diliminden doğrudan VO üretir; doğrulama atlanır.
   */
  public static fromTrusted(value: TimeZoneType): TimeZone {
    return new TimeZone(value);
  }

  /**
   *  Akıllı Factory: Diğer tüm VO'lar ile kusursuz uyum
   */
  public static create(timezone?: string | null) {
    const isBlank = !timezone || timezone.trim().length === 0;

    let instance: TimeZone | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        if (!TimeZone.isValid(timezone)) {
          throw new InvalidTimeZoneException(timezone);
        }

        const schemaFormat = TimeZone.toSchemaFormat(timezone);
        instance = new TimeZone(schemaFormat);
      } catch (e: any) {
        error = e;
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Geçersizse veya boşsa undefined döner (Akışı kesmez)
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Veri eksikse veya IANA standart dışıysa anında fırlatır
       */
      orThrow(exception?: Error): TimeZone {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidTimeZoneException();
        }
        return instance;
      },
    };
  }

  /**
   * 🎯 Default Fabrika: Sistem varsayılanı olan Europe_Istanbul döner
   */
  public static default(): TimeZone {
    return new TimeZone(TimeZoneSchema.enum.Europe_Istanbul);
  }

  /**
   * Type Guard: Giriş formatı ne olursa olsun geçerli bir zaman dilimi mi?
   */
  public static isValid(value: string): value is TimeZoneType {
    try {
      const ianaFormat = TimeZone.toIanaFormat(value);
      Intl.DateTimeFormat(undefined, { timeZone: ianaFormat });
      return true;
    } catch (e) {
      return false;
    }
  }

  private static toIanaFormat(value: string): string {
    if (value.includes('_') && !value.includes('/')) {
      return value.replace('_', '/');
    }
    return value;
  }

  private static toSchemaFormat(value: string): TimeZoneType {
    if (value.includes('/') && !value.includes('_')) {
      return value.replace('/', '_') as TimeZoneType;
    }
    return value as TimeZoneType;
  }

  public equals(other: TimeZone): boolean {
    return this._value === other.value;
  }

  /**
   * Bu zaman diliminin şu anki UTC offset'ini döner (Örn: "+03:00")
   */
  public getOffset(): string {
    const ianaZone = TimeZone.toIanaFormat(this._value);
    return dayjs().tz(ianaZone).format('Z');
  }

  public toString(): string {
    return this._value;
  }
}
