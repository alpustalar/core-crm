import { z } from 'zod';
import { capitalize } from '@common/utils';
import { Slug } from '@src/domain/value-objects/slug.vo';
import { InvalidNameException } from '@src/domain/exceptions/name.exceptions';

export class Name {
  private static readonly schema = z
    .string()
    .trim()
    .min(2, 'İsim en az 2 karakter olmalıdır.');
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  // 2. Disiplinli Factory: create().orThrow()
  public static create(value: string | null | undefined) {
    const result = this.schema.safeParse(value);

    // Normalizasyon: Boşlukları temizle ve capitalize et
    const normalized = result.success
      ? capitalize(result.data.replace(/\s+/g, ' ').trim())
      : undefined;

    const instance = normalized ? new Name(normalized) : undefined;

    return {
      instance,
      orThrow(exception?: Error): Name {
        if (!instance) {
          throw exception ?? new InvalidNameException();
        }
        return instance;
      },
    };
  }

  public static fromTrusted(value: string): Name {
    return new Name(value);
  }

  public equals(other: Name): boolean {
    return other instanceof Name && this._value === other.value;
  }

  public toSlug(): Slug {
    return Slug.create(this._value);
  }
}
