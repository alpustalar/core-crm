import { capitalize } from '@common/utils';
import { Slug } from '@src/domain/value-objects/slug.vo';
import { Guard } from '@common/domain/guards';

export class Name {
  private readonly _value: string;

  private constructor(value: string) {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    this._value = capitalize(cleaned);
  }

  get value(): string {
    return this._value;
  }

  public static create(value: string, throwMessage?: string) {
    return this.validate(value, throwMessage);
  }

  public static fromTrusted(value: string): Name {
    return new Name(value);
  }

  public static validate(value: string, throwMessage?: string): Guard<Name> {
    const name = new Name(value);
    return Guard.monitor(
      name,
      value.trim().length > 0,
      () => new Error(throwMessage)
    );
  }

  public equals(other: Name): boolean {
    return other && this._value === other.value;
  }

  toSlug(): Slug {
    return Slug.create(this._value);
  }
}
