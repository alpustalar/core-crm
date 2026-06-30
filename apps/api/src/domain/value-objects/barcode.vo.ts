import { z } from 'zod';
import { InvalidBarcodeException } from '@src/domain/exceptions/vo/barcode.exceptions';

export class Barcode {
  private static readonly schema = z
    .string()
    .regex(/^\d+$/, 'Barkod sadece rakamlardan oluşmalıdır.')
    .min(8, 'Barkod en az 8 karakter olmalıdır.')
    .max(14, 'Barkod en fazla 14 karakter olmalıdır.');

  private readonly _value: string;

  private constructor(value: string, trusted = false) {
    if (!trusted && !Barcode.schema.safeParse(value).success) {
      throw new InvalidBarcodeException();
    }
    this._value = value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) veriden doğrudan VO üretir; doğrulama atlanır.
   */
  public static fromTrusted(value: string): Barcode {
    return new Barcode(value, true);
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Akıllı Factory: Geriye doğrudan Guard'lanmış bir proxy nesne döner.
   * Bu nesne hem saf değeri taşır hem de orThrow yeteneğine sahiptir.
   */
  public static create(value: string | null | undefined) {
    const isBlank = !value || value.trim().length === 0;

    let instance: Barcode | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        instance = new Barcode(value);
      } catch {
        error = new InvalidBarcodeException();
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Boş veya geçersizse undefined döner (akışı kesmez).
       */
      instance: error ? undefined : instance,

    
      orThrow(exception?: Error): Barcode {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidBarcodeException();
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
