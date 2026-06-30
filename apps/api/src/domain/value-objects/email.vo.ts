import { z } from 'zod';
import { InvalidEmailException } from '@src/domain/exceptions/vo/email-address.exceptions';

export class Email {
  // 🎯 Gelen e-maili otomatik olarak küçük harfe çevirmek ve boşlukları temizlemek kurumsal bir standarttır
  private static readonly schema = z.string().trim().toLowerCase().email();

  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  /**
   * 🎯 Güvenilir Kurucu: Persisted (DB) e-postadan doğrudan VO üretir; doğrulama atlanır.
   */
  public static fromTrusted(value: string): Email {
    return new Email(value);
  }

  public static create(value: string | null | undefined) {
    const isBlank = !value || value.trim().length === 0;

    let instance: Email | undefined;
    let error: Error | undefined;

    if (!isBlank) {
      try {
        const sanitized = Email.schema.parse(value);
        instance = new Email(sanitized);
        // eslint-disable-next-line
      } catch (e: any) {
        error = new InvalidEmailException();
      }
    }

    return {
      /**
       * ➔ Opsiyonel Senaryo: Geçersizse veya boşsa undefined döner (Validasyon hatası fırlatmaz)
       */
      instance: error ? undefined : instance,

      /**
       * ➔ Zorunlu Senaryo: Boşsa veya validasyondan geçemediyse küt diye fırlatır.
       */
      orThrow(exception?: Error): Email {
        if (error || !instance) {
          throw exception ?? error ?? new InvalidEmailException();
        }
        return instance;
      },
    };
  }

  public equals(other: Email): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
