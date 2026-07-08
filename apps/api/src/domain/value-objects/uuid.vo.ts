import { randomUUID } from 'crypto';
import { z } from 'zod';
import { InvalidUuidException } from '@src/domain/exceptions/vo/uuid.exceptions';

export class UUID {
  private static readonly schema = z.uuid('Geçersiz UUID değeri sağlandı.');
  private readonly _value: string;

  private constructor(value: string, trusted = false) {
    if (!trusted) this.validate(value);
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Akıllı Factory: Geriye doğrudan sarmalanmış bir nesne döner.
   * Bu nesne hem saf değeri taşır hem de orThrow yeteneğine sahiptir.
   * Boş VEYA geçersiz değerde `instance` undefined olur; akış kesilmez.
   */
  public static create(value: string | null | undefined) {
    const isBlank = !value || value.trim().length === 0;

    let instance: UUID | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        instance = new UUID(value);
      } catch {
        error = new InvalidUuidException();
      }
    }

    return {
      instance: error ? undefined : instance,
      orThrow(exception?: Error): UUID {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidUuidException();
        }
        return instance;
      },
    };
  }

  /**
   * 🎯 Güvenilir Kurucu: Daha önce doğrulanmış/normalize edilmiş veriden (DB,
   * `toPersistence()` çıktısı) doğrudan VO üretir. Yeniden doğrulama maliyetini ve
   * Result sarmalayıcısını atlar. Sadece güvendiğin (persisted) veride kullan.
   */
  public static fromTrusted(value: string): UUID {
    return new UUID(value, true);
  }

  /**
   * 🎯 Sıfırdan güvenli bir UUID v4 üretir.
   */
  public static generate(): UUID {
    return new UUID(randomUUID());
  }

  public toString(): string {
    return this._value;
  }

  private validate(value: string): void {
    if (!UUID.schema.safeParse(value).success) {
      throw new InvalidUuidException();
    }
  }
}
