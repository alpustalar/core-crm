import { z } from 'zod';
import {
  InvalidVknChecksumException,
  InvalidVknFormatException,
} from '@src/domain/exceptions';

export class Vkn {
  private static readonly schema = z
    .string()
    .length(10, 'VKN 10 haneli olmalıdır.')
    .regex(/^\d+$/, 'VKN sadece rakamlardan oluşmalıdır.');

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  // 1. Merkezi Validasyon
  public static get validate() {
    return {
      input: (value: string | null | undefined) => {
        const trimmed = value?.trim();
        if (!trimmed)
          return { isValid: false, error: 'VKN boş olamaz.', type: 'FORMAT' };

        // Zod format kontrolü
        const formatResult = Vkn.schema.safeParse(trimmed);
        if (!formatResult.success) {
          return {
            isValid: false,
            error: formatResult.error.issues[0].message,
            type: 'FORMAT',
          };
        }

        // Checksum algoritma kontrolü
        if (!Vkn.isValidChecksum(trimmed)) {
          return {
            isValid: false,
            error: 'Geçersiz VKN (Checksum hatası).',
            type: 'CHECKSUM',
          };
        }

        return { isValid: true, data: trimmed };
      },
    };
  }

  public get value(): string {
    return this._value;
  }

  // 2. Disiplinli Factory
  public static create(value: string | null | undefined) {
    const validation = Vkn.validate.input(value);
    const instance = validation.isValid ? new Vkn(validation.data!) : undefined;

    return {
      instance,
      orThrow(exception?: Error): Vkn {
        if (!instance) {
          if (validation.type === 'CHECKSUM')
            throw exception ?? new InvalidVknChecksumException();
          throw exception ?? new InvalidVknFormatException();
        }
        return instance;
      },
    };
  }

  public static fromTrusted(value: string): Vkn {
    return new Vkn(value);
  }

  private static isValidChecksum(vkn: string): boolean {
    const digits = vkn.split('').map(Number);
    const checkDigit = digits[9];
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      const tmp = (digits[i] + (9 - i)) % 10;
      if (tmp !== 0) {
        let p = (tmp * Math.pow(2, 9 - i)) % 9;
        if (p === 0) p = 9;
        sum += p;
      }
    }
    return (10 - (sum % 10)) % 10 === checkDigit;
  }

  public equals(other: Vkn): boolean {
    return other instanceof Vkn && this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
