import { z } from 'zod';
import { InvalidFirebaseUidException } from '@src/domain/exceptions';

export class FirebaseUid {
  // Firebase UID'leri tam 28 karakterli alfanümerik yapılardır
  private static readonly schema = z
    .string()
    .length(28, 'Geçersiz Firebase UID uzunluğu.')
    .regex(/^[a-zA-Z0-9]+$/, 'Firebase UID sadece harf ve rakam içerebilir.');

  private readonly _value: string;

  private constructor(value: string, trusted = false) {
    if (!trusted && !FirebaseUid.schema.safeParse(value).success) {
      throw new InvalidFirebaseUidException();
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) veriden doğrudan VO üretir; doğrulamayı atlar.
   */
  public static fromTrusted(value: string): FirebaseUid {
    return new FirebaseUid(value, true);
  }

  /**
   * 🎯 Akıllı Factory: Boş VEYA geçersiz değerde `instance` undefined olur; akış kesilmez.
   */
  public static create(value: string | null | undefined) {
    const isBlank = !value || value.trim().length === 0;

    const instance = !isBlank ? new FirebaseUid(value) : undefined;

    return {
      instance,
      orThrow(exception?: Error): FirebaseUid {
        if (!instance) {
          throw exception ?? new InvalidFirebaseUidException();
        }
        return instance;
      },
    };
  }
}
