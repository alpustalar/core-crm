import { capitalize } from '@common/utils';
import { Slug } from '@src/domain/value-objects/slug.vo';

export class Name {
  private readonly _value: string;

  private constructor(value: string) {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    this._value = capitalize(cleaned);
  }

  get value(): string {
    return this._value;
  }

  public static create(value: string) {
    return new Name(value);
  }

  public static fromTrusted(value: string): Name {
    return new Name(value);
  }

  public equals(other: Name): boolean {
    return other && this._value === other.value;
  }

  toSlug(): Slug {
    return Slug.create(this._value);
  }
}
