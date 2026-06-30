import { z } from 'zod';
import {
  InvalidTcknChecksumException,
  InvalidTcknFormatException,
} from '@src/domain/exceptions/vo/tckn.exceptions';

export class TckNo {
  private static readonly schema = z
    .string()
    .length(11)
    .regex(/^\d+$/, 'TCKN sadece rakamlardan oluşmalıdır.')
    .refine((val) => val[0] !== '0', 'TCKN ilk hanesi 0 olamaz.');

  private readonly _value: string;

  // Constructor sadece %100 valide edilmiş temiz veriyi bağlar
  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) TCKN'den doğrudan VO üretir; format/checksum atlanır.
   */
  public static fromTrusted(value: string): TckNo {
    return new TckNo(value);
  }

  /**
   * 🎯 Akıllı Factory: Projedeki tüm VO'lar ile tek bir ortak dil
   */
  public static create(tckn?: string | null) {
    const isBlank = !tckn || tckn.trim().length === 0;

    let instance: TckNo | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        // 1. Temel Format Kontrolü (Zod)
        const formatResult = TckNo.schema.safeParse(tckn);
        if (!formatResult.success) {
          throw new InvalidTcknFormatException();
        }

        // 2. Matematiksel Algoritma Kontrolü (Algoritma)
        if (!TckNo.isValidChecksum(tckn)) {
          throw new InvalidTcknChecksumException();
        }

        instance = new TckNo(tckn);
      } catch (e: any) {
        error = e;
      }
    }

    return {
      instance: error ? undefined : instance,
      orThrow(exception?: Error): TckNo {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidTcknFormatException();
        }
        return instance;
      },
    };
  }

  /**
   * 🛠️ TCKN Doğrulama Algoritması (Statik olması artık daha mantıklı)
   */
  private static isValidChecksum(id: string): boolean {
    const digits = id.split('').map(Number);

    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const tenthDigit = (oddSum * 7 - evenSum) % 10;

    if (tenthDigit !== digits[9]) return false;

    const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    return totalSum % 10 === digits[10];
  }

  public equals(other: TckNo): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
