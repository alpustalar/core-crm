import {
  CurrencySchema,
  CurrencyType,
} from '@input-type-schemas/CurrencySchema';
import { InvalidCurrencyException } from '@src/domain/exceptions';

export class Currency {
  private readonly _value: CurrencyType;

  private constructor(value: CurrencyType) {
    this._value = value;
    Object.freeze(this);
  }

  /**
   * Static Validate (Getter): Sınıf düzeyinde ham string para birimini doğrular.
   * Örn: Currency.validate.code('USD').orThrow()
   */
  public static get validate() {
    return {
      code: (value?: string | null) => {
        if (!value || value.trim().length === 0) {
          return {
            isValid: false,
            error: 'Para birimi boş olamaz.',
            data: undefined,
          };
        }

        const normalized = value.trim().toUpperCase();
        const result = CurrencySchema.safeParse(normalized);

        return {
          isValid: result.success,
          error: result.success ? undefined : 'Geçersiz para birimi formatı.',
          data: result.success ? result.data : undefined,
        };
      },
    };
  }

  public static get enum() {
    return CurrencySchema.enum;
  }

  public get value(): CurrencyType {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) para biriminden doğrudan VO üretir; doğrulama atlanır.
   */
  public static fromTrusted(currency: CurrencyType): Currency {
    return new Currency(currency);
  }

  public static create(currencyStr?: string | null) {
    const isBlank = !currencyStr || currencyStr.trim().length === 0;

    const validation = isBlank ? null : Currency.validate.code(currencyStr);

    const isValid = isBlank ? true : validation!.isValid;

    const instance = isValid
      ? new Currency(isBlank ? CurrencySchema.enum.TRY : validation!.data!)
      : undefined;

    return {
      instance,

      orThrow(exception?: Error): Currency {
        if (!instance) {
          throw exception ?? new InvalidCurrencyException(currencyStr ?? '');
        }
        return instance;
      },
    };
  }

  public equals(other: Currency): boolean {
    return other instanceof Currency && this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
