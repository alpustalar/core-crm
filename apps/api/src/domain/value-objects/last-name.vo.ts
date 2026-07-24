import { z } from 'zod';
import { InvalidLastNameException } from '@src/domain/exceptions/last-name.exceptions';

export class LastName {
  // Boş olamaz, sadece harf (Türkçe karakterler dahil) ve tire/nokta gibi özel karakterler olabilir
  private static readonly schema = z
    .string()
    .trim()
    .min(2, 'Soyadı en az 2 karakter olmalıdır.');
  private readonly _value: string;

  // 1. Validasyon Şeması

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  public static get validate() {
    return {
      input: (value: string | null | undefined) => {
        const result = LastName.schema.safeParse(value);

        // İş kuralı: Normalizasyon (Büyük harf ve boşluk temizleme)
        const normalized = result.success
          ? result.data.replace(/\s+/g, '').toLocaleUpperCase('tr-TR')
          : undefined;

        return {
          isValid: result.success,
          error: result.success ? undefined : result.error.issues[0].message,
          data: normalized,
        };
      },
    };
  }

  get value(): string {
    return this._value;
  }

  // 2. Disiplinli Factory: create().orThrow()
  public static create(value: string | null | undefined) {
    const validation = LastName.validate.input(value);

    const instance = validation.isValid
      ? new LastName(validation.data!)
      : undefined;

    return {
      instance,
      orThrow(exception?: Error): LastName {
        if (!instance) {
          throw exception ?? new InvalidLastNameException();
        }
        return instance;
      },
    };
  }

  public static fromTrusted(value: string): LastName {
    return new LastName(value);
  }
}
