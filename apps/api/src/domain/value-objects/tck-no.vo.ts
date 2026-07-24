import { z } from 'zod';
import {
  InvalidTcknChecksumException,
  InvalidTcknFormatException,
} from '@src/domain/exceptions';

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

  public static get validate() {
    return {
      input: (value: string | null | undefined) => {
        const trimmed = value?.trim();
        if (!trimmed) return { isValid: false, error: 'TCKN boş olamaz.' };

        // 1. Zod ile format kontrolü
        const formatResult = TckNo.schema.safeParse(trimmed);
        if (!formatResult.success) {
          return {
            isValid: false,
            error: formatResult.error.issues[0].message,
          };
        }

        // 2. Algoritma ile checksum kontrolü
        if (!TckNo.isValidChecksum(trimmed)) {
          return { isValid: false, error: 'Geçersiz TCKN (Checksum hatası).' };
        }

        return { isValid: true, data: trimmed };
      },
    };
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

  public static create(value: string | null | undefined) {
    const validation = TckNo.validate.input(value);
    const instance = validation.isValid
      ? new TckNo(validation.data!)
      : undefined;

    return {
      instance,
      orThrow(exception?: Error): TckNo {
        if (!instance) {
          // Hatanın türüne göre doğru Exception'ı fırlatıyoruz
          if (validation.error?.includes('Checksum')) {
            throw exception ?? new InvalidTcknChecksumException();
          }
          throw exception ?? new InvalidTcknFormatException();
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
