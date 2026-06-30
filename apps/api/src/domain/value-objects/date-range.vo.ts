import {
  DateRangeExpiredException,
  InvalidDateRangeException,
} from '@src/domain/exceptions/vo/date-range.exceptions';
import { DateTimeManager } from '@common/infrastructure/date-time/date-time.manager';
import { TimeConflictException } from '@src/domain/exceptions/time-conflict.exception';

interface IDateRangePublicValidator {
  expiration: {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: (exception?: Error) => void;
  };
  overlapping: (
    other: DateRange,
    throwMsg?: string
  ) => {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: () => DateRange;
  };
}

interface IDateRangeStaticValidator {
  range: (
    startDate?: Date,
    endDate?: Date
  ) => {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: (exception?: Error) => void;
  };
}

export class DateRange {
  private readonly _startDate: Date;
  private readonly _endDate: Date;

  private constructor(startDate: Date, endDate: Date) {
    this._startDate = DateTimeManager.create(startDate);
    this._endDate = DateTimeManager.create(endDate);
    Object.freeze(this);
  }

  /**
   * 🎯 2. Static Validate (Getter): Sınıf düzeyinde, henüz nesne yaratılmadan ham tarihleri doğrular
   * Örn: DateRange.validate.range(start, end).orThrow()
   */
  public static get validate(): IDateRangeStaticValidator {
    return {
      range: (startDate?: Date, endDate?: Date) => {
        let hasError: boolean;
        if (!startDate || !endDate) {
          hasError = true;
        } else {
          hasError =
            DateTimeManager.isBefore(endDate, startDate) ||
            DateTimeManager.isSame(endDate, startDate);
        }

        return {
          isValid: !hasError,
          isInvalid: hasError,
          orThrow: (exception?: Error) => {
            if (hasError) {
              throw exception ?? new InvalidDateRangeException();
            }
          },
        };
      },
    };
  }

  get startDate(): Date {
    return new Date(this._startDate.getTime());
  }

  get endDate(): Date {
    return new Date(this._endDate.getTime());
  }

  /**
   * 🎯 1. Public Validate (Getter): Üretilmiş tarih aralığı üzerindeki iş kurallarını işletir
   * Örn: appointmentRange.validate.conflict(existingRange, 'Mesaiden sonra rdv verilemez').orThrow()
   */
  public get validate(): IDateRangePublicValidator {
    const self = this;

    return {
      expiration: {
        get isValid() {
          const now = DateTimeManager.create();
          return !DateTimeManager.isBefore(self._endDate, now);
        },
        get isInvalid() {
          const now = DateTimeManager.create();
          return DateTimeManager.isBefore(self._endDate, now);
        },
        orThrow: (exception?: Error) => {
          const now = DateTimeManager.create();
          if (DateTimeManager.isBefore(self._endDate, now)) {
            throw exception ?? new DateRangeExpiredException();
          }
        },
      },
      overlapping: (other: DateRange, throwMsg?: string) => {
        const isOverlapping = DateTimeManager.isOverlapping(
          { start: self._startDate, end: self._endDate },
          { start: other._startDate, end: other._endDate }
        );

        return {
          isValid: !isOverlapping,
          isInvalid: isOverlapping,
          orThrow: (): DateRange => {
            if (isOverlapping) {
              throw new TimeConflictException(throwMsg);
            }
            return self;
          },
        };
      },
    };
  }

  get durationInMinutes(): number {
    return DateTimeManager.diffInMinutes(this._endDate, this._startDate);
  }

  public get check() {
    const self = this;

    return {
      enclosing: (other: DateRange) => {
        const isValid = self.isEnclosing(other);

        return {
          isValid,
          isInvalid: !isValid,
          orThrow: (exception?: Error): DateRange => {
            if (!isValid) {
              throw (
                exception ??
                new Error('Belirtilen zaman aralığı hedef aralığı kapsamıyor.')
              );
            }
            return self;
          },
        };
      },
    };
  }
  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) tarihlerden doğrudan VO üretir; sıra doğrulaması atlanır.
   */
  public static fromTrusted(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }

  /**
   * 🎯 Akıllı Factory: Standart ordu nizamımız
   */
  public static create(
    startDate: Date | null | undefined,
    endDate: Date | null | undefined
  ) {
    const isBlank = !startDate || !endDate;

    let instance: DateRange | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        DateRange.validate.range(startDate, endDate).orThrow();
        instance = new DateRange(startDate, endDate);
      } catch (e: any) {
        error = e;
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Boş veya hatalıysa undefined döner, .value.value çirkinliğini çözer.
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Bitiş tarihi başlangıçtan önceyse anında patlatır.
       */
      orThrow(exception?: Error): DateRange {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidDateRangeException();
        }
        return instance;
      },
    };
  }

  public equals(other: DateRange): boolean {
    return (
      this._startDate.getTime() === other._startDate.getTime() &&
      this._endDate.getTime() === other._endDate.getTime()
    );
  }

  private isEnclosing(other: DateRange): boolean {
    return this._startDate >= other.startDate && this._endDate <= other.endDate;
  }
}
