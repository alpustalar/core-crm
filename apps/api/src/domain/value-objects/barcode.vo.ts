import { z } from 'zod';
import { InvalidBarcodeException } from '@src/domain/exceptions';

export class Barcode {
  private static readonly schema = z
    .string()
    .regex(/^\d+$/, 'Barkod sadece rakamlardan oluşmalıdır.')
    .min(8, 'Barkod en az 8 karakter olmalıdır.')
    .max(14, 'Barkod en fazla 14 karakter olmalıdır.');

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  public static get validate() {
    return {
      input: (value: string | null | undefined) => {
        const result = Barcode.schema.safeParse(value);

        return {
          isValid: result.success,
          error: result.error?.issues[0]?.message,
          value: result.success ? result.data : undefined,
        };
      },
    };
  }

  get value(): string {
    return this._value;
  }

  public static fromTrusted(value: string): Barcode {
    return new Barcode(value);
  }

  public static create(value: string | null | undefined) {
    const validation = Barcode.validate.input(value);

    const instance = validation.isValid
      ? new Barcode(validation.value!)
      : undefined;

    return {
      instance,

      orThrow(exception?: Error): Barcode {
        if (!instance) {
          throw exception ?? new InvalidBarcodeException();
        }
        return instance;
      },
    };
  }

  public equals(other: Barcode): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
