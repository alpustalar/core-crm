import { z } from 'zod';
import { InvalidStockCodeException } from '@src/domain/exceptions';

export class StockCode {
  // Zod Validasyon Şeması
  private static readonly schema = z
    .string()
    .min(3, 'Stok kodu en az 3 karakter olmalıdır.')
    .max(30, 'Stok kodu en fazla 30 karakter olmalıdır.');

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  // Validasyon mantığını merkeziyoruz
  public static get validate() {
    return {
      input: (value: string | null | undefined) => {
        const sanitized = value?.trim().toUpperCase();
        const result = StockCode.schema.safeParse(sanitized);

        return {
          isValid: result.success,
          error: result.success ? undefined : result.error.issues[0]?.message,
          data: result.success ? result.data : undefined,
        };
      },
    };
  }

  get value(): string {
    return this._value;
  }

  // Factory Metodu (create().orThrow())
  public static create(value: string | null | undefined) {
    const validation = StockCode.validate.input(value);
    const instance = validation.isValid
      ? new StockCode(validation.data!)
      : undefined;

    return {
      instance,
      orThrow(exception?: Error): StockCode {
        if (!instance) {
          throw exception ?? new InvalidStockCodeException(validation.error);
        }
        return instance;
      },
    };
  }

  public static fromTrusted(value: string): StockCode {
    return new StockCode(value);
  }

  public equals(other: StockCode): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
