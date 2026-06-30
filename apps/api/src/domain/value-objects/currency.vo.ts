import {
  CurrencySchema,
  CurrencyType,
} from '@input-type-schemas/CurrencySchema';
import { InvalidCurrencyException } from '@src/domain/exceptions/vo/currency.exceptions';

// Derleyicinin (TSC) context'i kaçırmasını önleyen statik validator arayüzü
interface ICurrencyStaticValidator {
  code: (value?: string) => {
    isValid: boolean;
    isInvalid: boolean;
    orThrow: (exception?: Error) => CurrencyType;
  };
}

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
  public static get validate(): ICurrencyStaticValidator {
    return {
      code: (value: string) => {
        const normalized = value.trim().toUpperCase();
        const result = CurrencySchema.safeParse(normalized);

        return {
          isValid: result.success,
          isInvalid: !result.success,
          orThrow: (exception?: Error): CurrencyType => {
            if (!result.success) {
              throw exception ?? new InvalidCurrencyException(value);
            }
            return result.data;
          },
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

  public static generate(currency: CurrencyType) {
    return new Currency(currency);
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) para biriminden doğrudan VO üretir; doğrulama atlanır.
   */
  public static fromTrusted(currency: CurrencyType): Currency {
    return new Currency(currency);
  }

  /**
   * 🎯 Akıllı Factory: Projedeki yeni "instance" ve "orThrow" ortak dili.
   */
  public static create(currencyStr?: string | null) {
    // Eğer null/undefined veya boş string gelirse sistem varsayılanı olarak TRY (Türk Lirası) hazırlarız.
    const isBlank = !currencyStr || currencyStr.trim().length === 0;

    let instance: Currency | undefined;
    let error: Error | undefined;

    try {
      if (isBlank) {
        instance = new Currency(CurrencySchema.enum.TRY);
      } else {
        // İçerideki hata fırlatan mekanizmayı tamamen statik validate metodumuzla çözüyoruz
        const validatedCode = Currency.validate.code(currencyStr).orThrow();
        instance = new Currency(validatedCode);
      }
    } catch (e: any) {
      error = e;
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Hata durumunda undefined döner, akışı bozmaz.
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Desteklenmeyen bir para birimi sızmaya çalışırsa anında patlatır.
       */
      orThrow(exception?: Error): Currency {
        if (error || !instance) {
          throw (
            exception ?? error ?? new InvalidCurrencyException(currencyStr ?? '')
          );
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
