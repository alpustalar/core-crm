import { z } from 'zod';
import {
  InvalidVknChecksumException,
  InvalidVknFormatException,
} from '@src/domain/exceptions/vo/vkn.exceptions';

export class Vkn {
  private static readonly schema = z
    .string()
    .length(10)
    .regex(/^\d+$/, 'VKN sadece rakamlardan oluşmalıdır.');

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  public static get validate() {
    return {
      format: (vkn: string) => {
        const isValid = Vkn.isValidFormat(vkn);
        return {
          isValid,
          isInvalid: !isValid,
          orThrow: (exception?: Error) => {
            if (!isValid) throw exception ?? new InvalidVknFormatException();
          },
        };
      },
      checksum: (vkn: string) => {
        const isValid = Vkn.isValidChecksum(vkn);
        return {
          isValid,
          isInvalid: !isValid,
          orThrow: (exception?: Error) => {
            if (!isValid) throw exception ?? new InvalidVknChecksumException();
          },
        };
      },
    };
  }

  public get value(): string {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) VKN'den doğrudan VO üretir; format/checksum atlanır.
   */
  public static fromTrusted(value: string): Vkn {
    return new Vkn(value);
  }

  /**
   * 🎯 Akıllı Factory: Projedeki yeni "instance" ve "orThrow" standart ordu nizamımız
   */
  public static create(vkn?: string | null) {
    const isBlank = !vkn || vkn.trim().length === 0;

    let instance: Vkn | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        Vkn.validate.format(vkn).orThrow();
        Vkn.validate.checksum(vkn).orThrow();

        instance = new Vkn(vkn);
      } catch (e: any) {
        error = e;
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Geçersizse veya boşsa undefined döner (Akışı kesmez, .value.value çirkinliğini çözer)
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Formata veya algoritmaya uymuyorsa anında fırlatır
       */
      orThrow(exception?: Error): Vkn {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidVknFormatException();
        }
        return instance;
      },
    };
  }

  /**
   * Resmî VKN algoritması: ilk 9 hane üzerinden 10. (kontrol) hane hesaplanır.
   */
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

  private static isValidFormat(vkn: string): boolean {
    return Vkn.schema.safeParse(vkn).success;
  }

  public equals(other: Vkn): boolean {
    if (!other) return false;
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
